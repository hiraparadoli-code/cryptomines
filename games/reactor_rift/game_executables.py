"""REACTOR RIFT game executables.

Groups the Reactor Energy system actions on top of the official Executables:
energy accumulation, level thresholds (OVERCHARGE / PLASMA SHIFT / RIFT CHARGE /
MELTDOWN), rift-zone win attribution and cascade counting. All randomness uses
the seeded SDK RNG (random.* after reset_seed(sim)) - fully deterministic.
"""

import random
from src.calculations.cluster import Cluster
from game_calculations import GameCalculations
from game_events import (
    reactor_energy_event,
    overcharge_event,
    plasma_shift_event,
    rift_charge_event,
    rift_zone_win_event,
    meltdown_event,
    _board_snapshot,
)

HIGH_SYMBOLS = ["CO", "RE", "QU", "SI"]


class GameExecutables(GameCalculations):
    """Game dependent grouped functions."""

    # --------------------------- round resets ------------------------------
    def reset_energy(self):
        """Reset the Reactor Energy system at the start of a betting round."""
        self.energy = 0
        self.reactor_level = 0
        self.levels_triggered = []          # levels fired this round (each once per round)
        self.rift_reel = None               # column holding the charged rift cell
        self.cascade_depth = 0              # tumbles performed this round
        self.max_cascade_depth = 0

    def reset_fs_spin_energy(self):
        """Overdrive: energy persists between bonus spins; only per-spin counters reset."""
        self.cascade_depth = 0

    # --------------------------- cluster/win step --------------------------
    def get_clusters_update_wins(self):
        """Find clusters, evaluate payouts and accumulate reactor energy."""
        clusters = Cluster.get_clusters(self.board, "wild")
        return_data = {"totalWin": 0, "wins": []}
        self.board, self.win_data, energy_gain = self.evaluate_clusters_energy(
            config=self.config,
            board=self.board,
            clusters=clusters,
            global_multiplier=self.global_multiplier,
            return_data=return_data,
        )
        Cluster.record_cluster_wins(self)
        self.win_manager.update_spinwin(self.win_data["totalWin"])
        self.pending_energy = energy_gain

    def apply_energy_and_levels(self):
        """After win events for a step: add cluster energy, then fire any crossed levels.

        Order of emission is fixed: reactorEnergy -> level events. Level events
        mutate the board deterministically BEFORE the tumble that follows.
        """
        gained = getattr(self, "pending_energy", 0)
        self.pending_energy = 0
        if gained > 0:
            self.energy += gained
            reactor_energy_event(self, gained, "cluster")
        self.check_energy_levels()

    def credit_energy_symbols(self):
        """Energy (E) symbols visible on the current board grant +2 each (once per reveal)."""
        positions = self.special_syms_on_board.get("energy", [])
        n = len(positions)
        if n > 0:
            gain = n * self.config.energy_symbol_bonus
            self.energy += gain
            reactor_energy_event(self, gain, "energySymbol")
            self.check_energy_levels()

    # --------------------------- thresholds --------------------------------
    def check_energy_levels(self):
        """Fire each newly-crossed threshold exactly once per round."""
        while self.reactor_level < len(self.config.energy_thresholds) and (
            self.energy >= self.config.energy_thresholds[self.reactor_level]
        ):
            nxt = self.reactor_level + 1
            self.reactor_level = nxt
            self.levels_triggered.append(nxt)
            if nxt == 1:
                self.overcharge_action()
            elif nxt == 2:
                self.plasma_shift_action()
            elif nxt == 3:
                self.rift_charge_action()
            elif nxt == 4:
                self.meltdown_action()

    # --------------------------- level actions -----------------------------
    def _eligible_positions(self):
        """Non-special, non-exploding board cells eligible for transformation."""
        out = []
        for reel in range(self.config.num_reels):
            for row in range(len(self.board[reel])):
                sym = self.board[reel][row]
                if not sym.defn.special and not sym.explode:
                    out.append({"reel": reel, "row": row})
        return out

    def overcharge_action(self):
        """L1 OVERCHARGE: one random eligible symbol becomes Wild (predetermined by seed)."""
        eligibles = self._eligible_positions()
        if not eligibles:
            return
        pos = random.choice(eligibles)
        new_sym = self.symbol_storage.create_symbol("W")  # wild flag set from special_flags
        self.board[pos["reel"]][pos["row"]] = new_sym
        self.get_special_symbols_on_board()
        overcharge_event(self, pos)

    def plasma_shift_action(self):
        """L2 PLASMA SHIFT: transform one column into high-value symbols (deterministic)."""
        col_candidates = list(range(self.config.num_reels))
        if self.rift_reel is not None:
            col_candidates.remove(self.rift_reel)
        reel = random.choice(col_candidates)
        chosen = random.choices(HIGH_SYMBOLS, weights=[10, 6, 3, 1], k=len(self.board[reel]))
        positions, names = [], []
        for row, name in enumerate(chosen):
            sym = self.create_symbol(name)
            self.board[reel][row] = sym
            positions.append({"reel": reel, "row": row})
            names.append(name)
        self.get_special_symbols_on_board()
        plasma_shift_event(self, reel, positions, names)

    def rift_charge_action(self):
        """L3 RIFT CHARGE: a Rift Cell appears in the central column (col 2).

        The rift marks a dimensional split: wins are attributed to LEFT (cols 0-1)
        and RIGHT (cols 3-4) zones which visually resolve independently before
        merging back. The rift column itself never participates in clusters.
        """
        reel = 2
        row = random.randrange(self.config.num_rows[reel])
        sym = self.create_symbol("S")
        self.board[reel][row] = sym
        self.rift_reel = reel
        self.get_special_symbols_on_board()
        self.record({"kind": "riftcharge", "symbol": "rift", "gametype": self.gametype})
        rift_charge_event(self, {"reel": reel, "row": row})

    def meltdown_action(self):
        """L4 REACTOR MELTDOWN: raise global multiplier and refill with volatile strips."""
        self.global_multiplier += self.config.meltdown_mult_gain
        self.update_global_mult_event_local()
        # Force the next tumble refills to come from the meltdown strip.
        self.force_next_tumble_strip = "RD_MELT"
        meltdown_event(self, self.global_multiplier, _board_snapshot(self))
        self.record({"kind": "meltdown", "symbol": "reactor", "gametype": self.gametype})

    def update_global_mult_event_local(self):
        from src.events.events import update_global_mult_event

        update_global_mult_event(self)

    # --------------------------- zone attribution -------------------------
    def emit_rift_zone_breakdown(self):
        """If the rift is charged, emit per-zone win breakdown for the current step."""
        if self.rift_reel is not None and self.win_data.get("wins"):
            zones = self.attribute_wins_to_zones(
                self.win_data["wins"], self.rift_reel, self.config.num_reels
            )
            if zones:
                rift_zone_win_event(self, zones)

    # --------------------------- tumble -----------------------------------
    def tumble_game_board(self):
        """Official tumble plus cascade-depth tracking; honors forced meltdown strip."""
        super().tumble_game_board()
        self.cascade_depth += 1
        self.max_cascade_depth = max(self.max_cascade_depth, self.cascade_depth)
        if getattr(self, "force_next_tumble_strip", None):
            # Replace freshly drawn refill symbols with meltdown-strip draws (deterministic).
            strip_id = self.force_next_tumble_strip
            self.force_next_tumble_strip = None
            strip = self.config.reels[strip_id]
            for reel in range(self.config.num_reels):
                n_new = len(self.new_symbols_from_tumble[reel])
                for i in range(n_new):
                    pos = (self.reel_positions[reel] + i) % len(strip[reel])
                    sym = self.create_symbol(strip[reel][pos])
                    self.board[reel][i] = sym
                    self.new_symbols_from_tumble[reel][i] = sym
            self.get_special_symbols_on_board()
