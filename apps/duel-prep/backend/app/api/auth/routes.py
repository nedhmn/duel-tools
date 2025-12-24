from fastapi import APIRouter

router = APIRouter()


@router.get("/verify")
def verify() -> dict[str, bool]:
    return {"ok": True}
