"""REACTOR RIFT game override.

Extends the universal state resets with the Reactor Energy system and enforces
distribution criteria through the official check_repeat mechanism.
"""

from game_executables import GameExecutables


class GameStateOverride(GameExecutables):
    """Override/extend universal state.py functions for Reactor Rift."""

    def reset_book(self):
        # Reset global values used across multiple projects
        super().reset_book()
        # Local round-level parameters
        self.tumble_win = 0
        self.pending_energy = 0
        self.force_next_tumble_strip = None
        self.reset_energy()

    def reset_fs_spin(self):
        super().reset_fs_spin()
        # Overdrive: energy persists between bonus spins (round-level reset already
        # happened at reset_book); only per-spin counters are cleared here.
        self.reset_fs_spin_energy()

    def assign_special_sym_function(self):
        pass

    def check_repeat(self) -> None:
        """Checks if the spin failed a criteria constraint at any point."""
        if self.repeat is False:
            win_criteria = self.get_current_betmode_distributions().get_win_criteria()
            if win_criteria is not None and self.final_win != win_criteria:
                self.repeat = True

            if self.get_current_distribution_conditions()["force_freegame"] and not (self.triggered_freegame):
                self.repeat = True

            if self.win_manager.running_bet_win == 0 and self.criteria != "0":
                self.repeat = True
