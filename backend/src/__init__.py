"""Backend application package.

Expose common subpackages (`api`, `db`, `domain`, `helper`) as top-level
aliases so imports keep working whether modules are executed from `backend/src`
directly or imported via `backend.src...`.
"""

from importlib import import_module
import sys


def _alias_subpackage(alias: str) -> None:
    module = import_module(f"{__name__}.{alias}")
    sys.modules.setdefault(alias, module)


for _subpackage in ("domain", "db", "api"):
    _alias_subpackage(_subpackage)

del _subpackage
