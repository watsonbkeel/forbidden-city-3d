"""R268 source admission only; reuse the unchanged owned-RSS/real-hall chain."""
import sys
import r267_hall_review as review
import r267_owned_rss_build as owned
from r267_owned_rss_observation import private_function

REF='refs/heads/dev/r268-upper-west-band'
PARENT='ace60ddae07be572b7b3d9e612875254e1a025fa'
PARENT_TREE='b145b9525b10c93a287ce4099a3068bd3526ac7b'
# Four-path product lineage only; the actual combined checkout has its own tree.
PRODUCT_TREE='6257174107a7b156c42c70f1ee9bc9655dbbf9de'
ROOT='tests/r268-dafotang-upper-west-band/'
ADDED=['.github/scripts/r268_west_band_review.py','.github/scripts/test_r268_west_band_review.py',
       '.github/workflows/r268-west-band-review.yml','src/scene/palace/special/DafotangUpperWestBand.js',
       ROOT+'component.test.mjs',ROOT+'pins.json']
MODIFIED=['README.md','src/scene/palace/special/RemainingOuterHalls.js',
          'tests/r267-dafotang-hall-review/capture.mjs','tests/r267-dafotang-hall-review/contract.mjs',
          'tests/r267-dafotang-hall-review/contract.test.mjs','tests/r267-dafotang-hall-review/review-hall.html',
          'tests/r267-dafotang-hall-review/review-hall.mjs']
CHANGES=sorted([('A',p) for p in ADDED]+[('M',p) for p in MODIFIED],key=lambda row:row[1])
PATHS=[p for _,p in CHANGES]
_event=private_function(review.validate_event,{'REF':REF})

def validate_event(env,event):
    _event(env,event)
    review.require(not any(env.get(k) for k in env if k.startswith('R268_')),'R268 overrides rejected')

validate_checkout=private_function(review.validate_checkout,{'REF':REF,'PARENT':PARENT,'PARENT_TREE':PARENT_TREE,
    'PRODUCT_TREE':PRODUCT_TREE,'ROOT':ROOT,'PATHS':PATHS,'CHANGES':CHANGES,'validate_event':validate_event})
# Code/defaults/closure and all guard/observer dependencies retain their identity.
ordinary=private_function(owned.ordinary,{'validate_checkout':validate_checkout,'__file__':__file__})
companion=private_function(review.main,{'validate_checkout':validate_checkout,'__file__':__file__})

def main():
    return ordinary() if len(sys.argv)==1 else companion()

if __name__=='__main__':
    try:raise SystemExit(main())
    except (ValueError,OSError,KeyError) as error:
        print('R268 west-band admission failed:',error,file=sys.stderr);raise SystemExit(1)
