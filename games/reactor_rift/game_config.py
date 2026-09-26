"""REACTOR RIFT - Stake Engine game configuration.

5x5 cascading cluster slot with the Reactor Energy board-transformation system.

Symbols
-------
LOW   : CI (Circuit), CR (Crystal), PL (Plasma), GE (Gear)
HIGH  : CO (Core), RE (Reactor), QU (Quantum), SI (Singularity)
SPECIAL: W (Wild, substitutes in clusters), E (Energy, +2 reactor energy),
         S (Rift scatter, bonus trigger symbol; not part of clusters)

Reactor Energy thresholds (per round): 10 / 20 / 35 / 50
  L1 OVERCHARGE    - one eligible symbol becomes Wild (predetermined)
  L2 PLASMA SHIFT  - one column transformed to high symbols (predetermined)
  L3 RIFT CHARGE   - a Rift Cell appears on the board (predetermined)
  L4 MELTDOWN      - +5 global multiplier and high-value meltdown fill
                    (predetermined reelstrip RD_MELT)

Bet modes: base, overdrive (buy-feature). Max win: 10,000x bet (SDK wincap).
"""

import os
from src.config.config import Config
from src.config.distributions import Distribution
from src.config.betmode import BetMode


class GameConfig(Config):
    """Singleton Reactor Rift game configuration class."""

    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance

    def __init__(self):
        super().__init__()
        self.game_id = "reactor_rift"
        self.provider_number = 0
        self.working_name = "Reactor Rift"
        self.wincap = 10000.0
        self.win_type = "cluster"
        self.rtp = 0.9650
        self.construct_paths()

        # ------------------------------ Board -------------------------------
        self.num_reels = 5
        self.num_rows = [5] * self.num_reels

        # ----------------------------- Paytable -----------------------------
        # Cluster sizes 5,6,7,8,9,10,11,12+ (board max cluster = 25)
        t1, t2, t3, t4, t5, t6, t7, t8 = (5, 5), (6, 6), (7, 7), (8, 9), (10, 11), (12, 14), (15, 17), (18, 25)
        pay_group = {
            # LOW symbols
            (t1, "CI"): 0.20, (t2, "CI"): 0.50, (t3, "CI"): 1.00, (t4, "CI"): 2.00,
            (t5, "CI"): 4.00, (t6, "CI"): 8.00, (t7, "CI"): 15.0, (t8, "CI"): 30.0,
            (t1, "CR"): 0.25, (t2, "CR"): 0.60, (t3, "CR"): 1.25, (t4, "CR"): 2.50,
            (t5, "CR"): 5.00, (t6, "CR"): 10.0, (t7, "CR"): 18.0, (t8, "CR"): 35.0,
            (t1, "PL"): 0.30, (t2, "PL"): 0.75, (t3, "PL"): 1.50, (t4, "PL"): 3.00,
            (t5, "PL"): 6.00, (t6, "PL"): 12.0, (t7, "PL"): 22.0, (t8, "PL"): 45.0,
            (t1, "GE"): 0.40, (t2, "GE"): 1.00, (t3, "GE"): 2.00, (t4, "GE"): 4.00,
            (t5, "GE"): 8.00, (t6, "GE"): 16.0, (t7, "GE"): 30.0, (t8, "GE"): 60.0,
            # HIGH symbols
            (t1, "CO"): 0.60, (t2, "CO"): 1.50, (t3, "CO"): 3.00, (t4, "CO"): 6.00,
            (t5, "CO"): 12.0, (t6, "CO"): 24.0, (t7, "CO"): 45.0, (t8, "CO"): 90.0,
            (t1, "RE"): 1.00, (t2, "RE"): 2.50, (t3, "RE"): 5.00, (t4, "RE"): 10.0,
            (t5, "RE"): 20.0, (t6, "RE"): 40.0, (t7, "RE"): 75.0, (t8, "RE"): 150.0,
            (t1, "QU"): 1.50, (t2, "QU"): 4.00, (t3, "QU"): 8.00, (t4, "QU"): 15.0,
            (t5, "QU"): 30.0, (t6, "QU"): 60.0, (t7, "QU"): 110.0, (t8, "QU"): 220.0,
            (t1, "SI"): 2.50, (t2, "SI"): 6.00, (t3, "SI"): 12.5, (t4, "SI"): 25.0,
            (t5, "SI"): 50.0, (t6, "SI"): 100.0, (t7, "SI"): 180.0, (t8, "SI"): 350.0,
        }
        self.paytable = self.convert_range_table(pay_group)

        self.include_padding = True
        self.special_symbols = {"wild": ["W"], "scatter": ["S"], "energy": ["E"]}

        # ------------------------- Reactor Energy ---------------------------
        # Energy awarded per winning cluster size (tunable for simulation).
        self.energy_table = {5: 1, 6: 2, 7: 2, 8: 3, 9: 3, 10: 4, 11: 4}  # 12+ -> 5
        self.energy_max_per_cluster = 5
        self.energy_symbol_bonus = 2          # landing an E symbol adds +2
        self.energy_thresholds = [10, 20, 35, 50]
        self.meltdown_mult_gain = 5           # global multiplier added at L4

        # ------------------------ Freespin triggers -------------------------
        # kind = number of Rift (S) symbols visible on the initial reveal.
        self.freespin_triggers = {
            self.basegame_type: {3: 8, 4: 12, 5: 16},
            self.freegame_type: {3: 4, 4: 6, 5: 8},
        }
        self.anticipation_triggers = {
            self.basegame_type: min(self.freespin_triggers[self.basegame_type].keys()) - 1,
            self.freegame_type: min(self.freespin_triggers[self.freegame_type].keys()) - 1,
        }

        # ------------------------------ Reels -------------------------------
        reels = {
            "BR0": "BR0.csv",     # base reelstrips
            "FR0": "FR0.csv",     # overdrive bonus reelstrips
            "RD_MELT": "RD_MELT.csv",  # meltdown forced refill strips
        }
        # Populate valid-symbol sets before validating reelstrips.
        self.get_special_symbol_names()
        self.get_paying_symbols()
        self.all_valid_sym_names = set(self.paying_symbol_names) | set(self.special_sybol_names)
        self.reels = {}
        for r, f in reels.items():
            self.reels[r] = self.read_reels_csv(os.path.join(self.reels_path, f))
            self.validate_reel_symbols(self.reels[r])

        mode_maxwins = {"base": 10000.0, "overdrive": 10000.0}

        def dist_set(mode):
            """Shared distribution set for a bet mode (identical math core)."""
            return [
                Distribution(
                    criteria="wincap",
                    quota=0.001,
                    win_criteria=mode_maxwins[mode],
                    conditions={
                        "reel_weights": {
                            self.basegame_type: {"BR0": 1},
                            self.freegame_type: {"FR0": 1, "RD_MELT": 5},
                        },
                        "scatter_triggers": {3: 1, 4: 2, 5: 3},
                        "force_wincap": True,
                        "force_freegame": True,
                    },
                ),
                Distribution(
                    criteria="freegame",
                    quota=0.06,
                    conditions={
                        "reel_weights": {
                            self.basegame_type: {"BR0": 1},
                            self.freegame_type: {"FR0": 1},
                        },
                        "scatter_triggers": {3: 6, 4: 2, 5: 1},
                        "force_wincap": False,
                        "force_freegame": True,
                    },
                ),
                Distribution(
                    criteria="0",
                    quota=0.30,
                    win_criteria=0.0,
                    conditions={
                        "reel_weights": {self.basegame_type: {"BR0": 1}},
                        "force_wincap": False,
                        "force_freegame": False,
                    },
                ),
                Distribution(
                    criteria="basegame",
                    quota=0.64,
                    conditions={
                        "reel_weights": {self.basegame_type: {"BR0": 1}},
                        "force_wincap": False,
                        "force_freegame": False,
                    },
                ),
            ]

        self.bet_modes = [
            BetMode(
                name="base",
                cost=1.0,
                rtp=self.rtp,
                max_win=mode_maxwins["base"],
                auto_close_disabled=False,
                is_feature=True,
                is_buybonus=False,
                distributions=dist_set("base"),
            ),
            BetMode(
                name="overdrive",
                cost=50.0,
                rtp=self.rtp,
                max_win=mode_maxwins["overdrive"],
                auto_close_disabled=False,
                is_feature=True,
                is_buybonus=True,
                distributions=dist_set("overdrive"),
            ),
        ]
