from pathlib import Path
import re
root = Path(__file__).resolve().parent.parent
errors=[]
for p in root.rglob('*.html'):
    text = p.read_text(encoding='utf-8', errors='ignore')
    for m in re.finditer(r'(?:href|src)="([^"]+)"', text):
        ref=m.group(1)
        if ref.startswith(('http://','https://','data:')):
            continue
        # normalize target
        if ref.startswith('/'):
            target = root / ref.lstrip('/')
        else:
            target = (p.parent / ref).resolve()
        if not target.exists():
            errors.append((str(p.relative_to(root)), ref, str(target.relative_to(root) if target.exists() else target)))

print('BROKEN LINKS:', len(errors))
for e in errors:
    print(e)
