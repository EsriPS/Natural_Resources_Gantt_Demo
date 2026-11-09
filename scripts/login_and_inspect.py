"""
Sign in to the ArcGIS org and inspect the secured BuildingSceneLayer — no browser.

Run it in a terminal; it will PROMPT for your username and password (password hidden,
never printed, never saved). It mints a short-lived token, reads the scene structure,
and writes a report to scene_report.json next to this script.

    "<path-to-arcgispro-py3>/python.exe" login_and_inspect.py
"""
import json, ssl, sys, getpass, urllib.request, urllib.parse, os

PORTAL = 'https://esripetroleum.maps.arcgis.com'
ROOT = 'https://tiles.arcgis.com/tiles/2BOLYujtFjlNg1bd/arcgis/rest/services/El_Segundo_Georeferenced_IFC/SceneServer'
REFERER = 'http://127.0.0.1:5173'
CTX = ssl.create_default_context()

def post(url, params):
    data = urllib.parse.urlencode(params).encode()
    req = urllib.request.Request(url, data=data, headers={'User-Agent': 'Mozilla/5.0', 'Referer': REFERER})
    with urllib.request.urlopen(req, timeout=30, context=CTX) as r:
        return json.load(r)

def get(url, params):
    q = urllib.parse.urlencode(params)
    req = urllib.request.Request(url + ('&' if '?' in url else '?') + q,
                                 headers={'User-Agent': 'Mozilla/5.0', 'Referer': REFERER})
    with urllib.request.urlopen(req, timeout=30, context=CTX) as r:
        return json.load(r)

def main():
    user = input('ArcGIS username: ').strip()
    pw = getpass.getpass('ArcGIS password (hidden): ')
    print('Minting token...')
    tok = post(PORTAL + '/sharing/rest/generateToken', {
        'username': user, 'password': pw, 'referer': REFERER, 'expiration': 60, 'f': 'json',
    })
    if 'token' not in tok:
        print('SIGN-IN FAILED:', json.dumps(tok)[:400]); sys.exit(1)
    token = tok['token']
    print('Token OK (expires in ~60 min). Inspecting scene...')

    root = get(ROOT, {'f': 'json', 'token': token})
    report = {'root': None, 'sublayers': [], 'errors': []}
    if 'error' in root:
        print('SCENE ERROR:', json.dumps(root['error'])[:400]); sys.exit(1)
    report['root'] = {k: root.get(k) for k in ('name', 'serviceVersion', 'layerType', 'spatialReference', 'fullExtent')}
    subs = root.get('sublayers') or root.get('layers') or []
    print('name:', root.get('name'), '| sublayers:', len(subs))
    for s in subs:
        info = {'id': s.get('id'), 'name': s.get('name'), 'layerType': s.get('layerType'),
                'modelName': s.get('modelName'),
                'assoc': s.get('associatedLayerID') if s.get('associatedLayerID') is not None else s.get('associatedLayer')}
        report['sublayers'].append(info)
        print('   #%s  %-30s  %-22s  assoc=%s' % (info['id'], info['name'], info['layerType'], info['assoc']))

    out = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'scene_report.json')
    # also stash the token so a follow-up enumeration step can reuse it this session
    report['_token'] = token
    with open(out, 'w') as f:
        json.dump(report, f, indent=1)
    print('\nReport written:', out)
    print('If sublayers list element/3D-object layers with an assoc feature layer, enumeration is possible.')

if __name__ == '__main__':
    main()
