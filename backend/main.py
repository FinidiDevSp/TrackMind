"""Entry point for starting the FastAPI application with uvicorn.

This module simply exposes the FastAPI ``app`` defined in ``api.py`` so
that it can be referenced as ``main:app`` when launching uvicorn from the
``backend`` directory.
"""

from api import app
