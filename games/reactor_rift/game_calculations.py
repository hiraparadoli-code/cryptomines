"""REACTOR RIFT game calculations.

Extends the official cluster evaluation with:
 - Reactor Energy accumulation per winning cluster (deterministic).
 - Rift-zone win attribution for the frontend split visualization.
"""

from src.executables.executables import Executables
from src.calculations.cluster import Cluster


class GameCalculations(Executables):
    """Game-specific calculation functions."""

    @staticmethod
    def energy_for_cluster_size(size: int, config) -> int:
        """Reactor energy gained from a winning cluster of ``size`` symbols.

        5 -> +1 | 6-7 -> +2 | 8-9 -> +3 | 10-11 -> +4 | 12+ -> +5
        Values are read from config.energy_table so they can be tuned.
        """
        table = config.energy_table
        if size in table:
            return table[size]
        return config.energy_max_per_cluster  # 12+

    @staticmethod
    def attribute_wins_to_zones(wins: list, rift_reel: int, num_reels: int) -> list:
        """Split win records into LEFT/RIGHT zones around the rift column.

        Deterministic pure function used only to enrich events for rendering;
        it never changes payout amounts. Clusters spanning both sides belong to
        a "span" bucket and count toward neither zone-only total.
        """
        zones = {
            "left": {"zone": "left", "reels": list(range(0, rift_reel)), "win": 0, "wins": []},
            "right": {"zone": "right", "reels": list(range(rift_reel + 1, num_reels)), "win": 0, "wins": []},
            "span": {"zone": "span", "reels": [], "win": 0, "wins": []},
        }
        for w in wins:
            reels = {p["reel"] for p in w["positions"]}
            side_left = any(r < rift_reel for r in reels)
            side_right = any(r > rift_reel for r in reels)
            if side_left and side_right:
                bucket = zones["span"]
            elif side_left:
                bucket = zones["left"]
            elif side_right:
                bucket = zones["right"]
            else:
                bucket = zones["span"]
            bucket["wins"].append(
                {
                    "symbol": w["symbol"],
                    "clusterSize": w["clusterSize"],
                    "win": w["win"],
                    "positions": [{"reel": p["reel"], "row": p["row"] + 1} for p in w["positions"]],
                }
            )
            bucket["win"] += w["win"]
        out = []
        for key in ("left", "right", "span"):
            z = zones[key]
            z["win"] = int(round(z["win"] * 100, 0))
            for x in z["wins"]:
                x["win"] = int(round(x["win"] * 100, 0))
            if z["wins"]:
                out.append(z)
        return out

    def evaluate_clusters_energy(self, config, board, clusters, global_multiplier, return_data):
        """Official-style cluster evaluation plus energy accumulation.

        Mirrors src.calculations.cluster.Cluster.evaluate_clusters but records
        per-cluster energy gains on the gamestate (deterministic math truth).
        """
        total_win = 0
        energy_gain = 0
        for sym in clusters:
            for cluster in clusters[sym]:
                syms_in_cluster = len(cluster)
                if (syms_in_cluster, sym) in config.paytable:
                    sym_win = config.paytable[(syms_in_cluster, sym)]
                    symwin_mult = sym_win * global_multiplier
                    total_win += symwin_mult
                    json_positions = [{"reel": p[0], "row": p[1]} for p in cluster]
                    central_pos = Cluster.get_central_cluster_position(json_positions)
                    return_data["wins"] += [
                        {
                            "symbol": sym,
                            "clusterSize": syms_in_cluster,
                            "win": symwin_mult,
                            "positions": json_positions,
                            "meta": {
                                "globalMult": global_multiplier,
                                "winWithoutMult": sym_win,
                                "overlay": {"reel": central_pos[0], "row": central_pos[1]},
                            },
                        }
                    ]
                    energy_gain += self.energy_for_cluster_size(syms_in_cluster, config)
                    for positions in cluster:
                        board[positions[0]][positions[1]].explode = True
        return_data["totalWin"] += total_win
        return board, return_data, energy_gain
