"""R270 source admission only; reuse the unchanged owned-RSS/real-hall chain."""
import sys
import r267_hall_review as review
import r267_owned_rss_build as owned
from r267_owned_rss_observation import private_function

REF='refs/heads/dev/r270-upper-pendants'
PARENT='27229692bd1edb816fa3460cb94ee7a51579d8af'
PARENT_TREE='056398ec0b85683a98eeea2587b8b7743d6ba435'
# Four-path product lineage only; the actual combined checkout has its own tree.
PRODUCT_TREE='465f31eac10df9731bb89936a0f93c0daed529e0'
ROOT='tests/r270-dafotang-upper-pendants/'
ADDED=['.github/scripts/r270_upper_pendants_review.py','.github/scripts/test_r270_upper_pendants_review.py',
       '.github/workflows/r270-upper-pendants-review.yml','src/scene/palace/special/DafotangUpperPendants.js',
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
    review.require(not any(env.get(k) for k in env if k.startswith(('R270_','R269_','R268_'))),'R270 overrides rejected')

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
        print('R270 upper-pendants admission failed:',error,file=sys.stderr);raise SystemExit(1)
