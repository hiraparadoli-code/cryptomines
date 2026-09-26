"""REACTOR RIFT custom game events.

Follows the official sample-game custom-event pattern (see games/0_0_cluster/game_events.py):
plain dicts with an ``index`` (position in the book event list) and a string ``type``,
added through ``gamestate.book.add_event(...)``. All values are taken from the
deterministic math state - the frontend only animates what these events describe.
"""

from copy import deepcopy

# Custom event type constants (Engine-compatible string types)
REACTOR_ENERGY = "reactorEnergy"          # energy meter update after a win step
OVERCHARGE = "overcharge"                 # L1: symbol -> Wild conversion
PLASMA_SHIFT = "plasmaShift"              # L2: column transformation
RIFT_CHARGE = "riftCharge"                # L3: rift cell appears
RIFT_ZONE_WIN = "riftZoneWin"             # zone-by-zone win resolution breakdown
MELTDOWN = "reactorMeltdown"              # L4: meltdown transform + multiplier


def _board_snapshot(gamestate, include_padding=True):
    """Serialize the current board to the same shape used by reveal/tumble events."""
    from src.events.events import json_ready_sym

    special_attributes = list(gamestate.config.special_symbols.keys())
    board_client = []
    for reel, _ in enumerate(gamestate.board):
        col = []
        for row in range(len(gamestate.board[reel])):
            col.append(json_ready_sym(gamestate.board[reel][row], special_attributes))
        if include_padding:
            col = [json_ready_sym(gamestate.top_symbols[reel], special_attributes)] + col
            col.append(json_ready_sym(gamestate.bottom_symbols[reel], special_attributes))
        board_client.append(col)
    return board_client


def reactor_energy_event(gamestate, gained: int, source: str):
    """Emit updated reactor energy for the current round.

    Args:
        gained: energy added by the latest step (cluster win / energy symbol).
        source: "cluster", "energySymbol".
    """
    event = {
        "index": len(gamestate.book.events),
        "type": REACTOR_ENERGY,
        "amount": int(gained),
        "total": int(gamestate.energy),
        "level": int(gamestate.reactor_level),
        "source": source,
    }
    gamestate.book.add_event(event)


def overcharge_event(gamestate, position: dict):
    """L1 OVERCHARGE: one eligible symbol became Wild at ``position`` (padding rows offset applied)."""
    event = {
        "index": len(gamestate.book.events),
        "type": OVERCHARGE,
        "level": 1,
        "position": {"reel": position["reel"], "row": position["row"] + 1},
        "symbol": "W",
    }
    gamestate.book.add_event(event)


def plasma_shift_event(gamestate, reel: int, positions: list, symbols: list):
    """L2 PLASMA SHIFT: column ``reel`` transformed; full result predetermined."""
    event = {
        "index": len(gamestate.book.events),
        "type": PLASMA_SHIFT,
        "level": 2,
        "reel": reel,
        "positions": [{"reel": p["reel"], "row": p["row"] + 1} for p in positions],
        "symbols": symbols,
    }
    gamestate.book.add_event(event)


def rift_charge_event(gamestate, position: dict):
    """L3 RIFT CHARGE: a Rift Cell appeared at ``position``."""
    event = {
        "index": len(gamestate.book.events),
        "type": RIFT_CHARGE,
        "level": 3,
        "position": {"reel": position["reel"], "row": position["row"] + 1},
    }
    gamestate.book.add_event(event)


def rift_zone_win_event(gamestate, zones: list):
    """Rift split visualization: per-zone win breakdown of the current win step.

    ``zones`` entries: {"zone": "left"/"right", "reels": [...], "win": cents-int,
    "wins": [{symbol, clusterSize, positions(padding-adjusted)}]}.
    """
    event = {
        "index": len(gamestate.book.events),
        "type": RIFT_ZONE_WIN,
        "zones": deepcopy(zones),
    }
    gamestate.book.add_event(event)


def meltdown_event(gamestate, new_mult: int, board: list):
    """L4 REACTOR MELTDOWN: global multiplier raised and board refilled (full board included)."""
    event = {
        "index": len(gamestate.book.events),
        "type": MELTDOWN,
        "level": 4,
        "globalMult": int(new_mult),
        "board": board,
    }
    gamestate.book.add_event(event)
