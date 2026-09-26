"""REACTOR RIFT core spin/feature flow (official Engine run_spin pattern).

Event order per win step: reveal -> winInfo -> reactorEnergy -> [level events]
-> updateGlobalMult/wincap -> riftZoneWin -> tumbleBoard -> setWin/setTotalWin
-> ... -> finalWin. The Reactor Energy system and all board transformations are
computed here in the math engine; the frontend only replays these events.
"""

from game_override import GameStateOverride


class GameState(GameStateOverride):
    """Core function handling simulation results."""

    def run_spin(self, sim, simulation_seed=None):
        self.reset_seed(sim)
        self.repeat = True
        while self.repeat:
            # Reset simulation variables and draw a new board based on betmode criteria.
            self.reset_book()
            self.draw_board()
            # Energy symbols landing on the reveal grant energy (deterministic).
            self.credit_energy_symbols()

            self.get_clusters_update_wins()
            self.emit_tumble_win_events()
            self.apply_energy_and_levels()
            self.emit_rift_zone_breakdown()

            while self.win_data["totalWin"] > 0 and not (self.wincap_triggered):
                self.tumble_game_board()
                self.get_clusters_update_wins()
                self.emit_tumble_win_events()
                self.apply_energy_and_levels()
                self.emit_rift_zone_breakdown()

            self.set_end_tumble_event()
            self.win_manager.update_gametype_wins(self.gametype)

            if self.check_fs_condition() and self.check_freespin_entry():
                self.run_freespin_from_base()

            self.evaluate_finalwin()
            self.check_repeat()

        self.imprint_wins()

    def run_freespin(self):
        self.reset_fs_spin()
        while self.fs < self.tot_fs:
            self.update_freespin()
            self.draw_board()
            # Overdrive: energy persists between bonus spins.
            self.credit_energy_symbols()

            self.get_clusters_update_wins()
            self.emit_tumble_win_events()
            self.apply_energy_and_levels()
            self.emit_rift_zone_breakdown()
            while self.win_data["totalWin"] > 0 and not (self.wincap_triggered):
                self.tumble_game_board()
                self.get_clusters_update_wins()
                self.emit_tumble_win_events()
                self.apply_energy_and_levels()
                self.emit_rift_zone_breakdown()

            self.set_end_tumble_event()
            self.win_manager.update_gametype_wins(self.gametype)

            if self.check_fs_condition():
                self.update_fs_retrigger_amt()

        self.end_freespin()
