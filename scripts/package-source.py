"""Create a portable source archive without dependencies, caches or test outputs."""
from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED
import sys

root = Path(__file__).resolve().parents[1]
output = Path(sys.argv[1]).resolve() if len(sys.argv) > 1 else root.parent / 'KAVIN-clean-handoff.zip'
ignored = {'node_modules', '.next', '.git', 'qa', 'playwright-report', 'test-results', '__pycache__'}
files = [p for p in root.rglob('*') if p.is_file() and not any(part in ignored for part in p.relative_to(root).parts) and p.suffix not in {'.zip', '.tsbuildinfo'} and not p.name.startswith('.env')]
with ZipFile(output, 'w', ZIP_DEFLATED) as archive:
    for file in sorted(files):
        archive.write(file, Path('kavin-redesign') / file.relative_to(root))
with ZipFile(output) as archive:
    assert archive.testzip() is None
    required = {'kavin-redesign/package.json', 'kavin-redesign/package-lock.json', 'kavin-redesign/README.md', 'kavin-redesign/HANDOFF.md'}
    assert required.issubset(archive.namelist())
print(f'{output}\n{len(files)} files, {output.stat().st_size:,} bytes')
