import re

DIGIPIN_ALLOWED_PATTERN = re.compile(r"^[FCJKLMPT2-9]+$")

def is_valid_digipin(digipin: str) -> bool:
    """Validate if a given digipin string is valid."""    
    return len(digipin) == 10 and bool(DIGIPIN_ALLOWED_PATTERN.fullmatch(digipin))
