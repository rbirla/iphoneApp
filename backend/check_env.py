import sys
print('Python executable:', sys.executable)
print('Virtual env active:', hasattr(sys, 'real_prefix') or (hasattr(sys, 'base_prefix') and sys.base_prefix != sys.prefix))
print('Python path:')
for path in sys.path:
    print(f'  {path}')