"""R269 source admission only; reuse the unchanged owned-RSS/real-hall chain."""
import sys
import r267_hall_review as review
import r267_owned_rss_build as owned
from r267_owned_rss_observation import private_function

REF='refs/heads/dev/r269-upper-east-band'
PARENT='0d1558a3b799e8c3a3c89a6dd5623847e0887c78'
PARENT_TREE='4087deb43aade258b6814d7e580875238ff5c010'
# Four-path product lineage only; the actual combined checkout has its own tree.
PRODUCT_TREE='8da3084dd86a8345d01dd04ac248e188eca1cc12'
ROOT='tests/r269-dafotang-upper-east-band/'
ADDED=['.github/scripts/r269_east_band_review.py','.github/scripts/test_r269_east_band_review.py',
       '.github/workflows/r269-east-band-review.yml','src/scene/palace/special/DafotangUpperEastBand.js',
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
    review.require(not any(env.get(k) for k in env if k.startswith(('R269_','R268_'))),'R269 overrides rejected')

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
        print('R269 east-band admission failed:',error,file=sys.stderr);raise SystemExit(1)
