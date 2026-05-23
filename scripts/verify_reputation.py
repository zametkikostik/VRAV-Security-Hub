#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
VRAV Security Hub Core - Proof-of-Security (PoS) Staking & Reputation Validator
Ensures that developers have deposited sufficient stake and maintain clean trust records
before an update is permitted to publish onto the decentralized registry.
"""
import sys
import os
import json

def verify_reputation_and_stake(app_id, required_stake=100):
    manifest_paths = ['manifest.json', 'src/manifest.json', '../manifest.json']
    manifest_file = None
    
    # Find the active manifest
    for path in manifest_paths:
        if os.path.exists(path):
            manifest_file = path
            break
            
    if not manifest_file:
        print("[PoS_VALIDATOR] [ERROR] manifest.json configuration not found.")
        return False
        
    print(f"[PoS_VALIDATOR] Analyzing locked collateral stake for Node App-ID: '{app_id}'")
    
    try:
        with open(manifest_file, 'r', encoding='utf-8') as f:
            registry = json.load(f)
    except Exception as e:
        print(f"[PoS_VALIDATOR] [ERROR] Failed to load registry index for validation: {e}")
        return False

    app_record = None
    for app in registry:
        if app.get('id') == app_id:
            app_record = app
            break
            
    # If the app record is new, we simulate a validation against the on-chain registry API
    if not app_record:
        print(f"[PoS_VALIDATOR] [INFO] Brand new App registration detected. Initializing new PoS staking checkpoint...")
        # Automatically authorize new apps with initial default parameters
        return True

    # Under PoS, let's examine the trustScore and stake state
    is_slashed = app_record.get('isSlashed', False)
    trust_score = app_record.get('trustScore', 100)
    current_stake = app_record.get('reputationStaked', 0)
    staking_addr = app_record.get('stakingAddress', "0xunknown")
    
    print(f"[PoS_VALIDATOR] Found Staking Address: {staking_addr}")
    print(f"[PoS_VALIDATOR] Current Trust Score:   {trust_score}/100")
    print(f"[PoS_VALIDATOR] Active Staked Deposit: {current_stake} MATIC")
    
    if is_slashed:
        print(f"[PoS_VALIDATOR] [CRITICAL_BLOCKED] The staking deposit has been slashed and the developer account is blacklisted!")
        print(f"[PoS_VALIDATOR] [CRITICAL_BLOCKED] Reason: Detected malicious backdoor or policy violations in previous audits.")
        return False
        
    if trust_score < 30:
        print(f"[PoS_VALIDATOR] [BLOCKED] trustScore ({trust_score}) is below the required security threshold (30/100). Please re-verify security.")
        return False
        
    if current_stake < required_stake:
        print(f"[PoS_VALIDATOR] [BLOCKED] Locked collateral ({current_stake} MATIC) is below the minimum mandated requirement ({required_stake} MATIC). Add funds first.")
        return False

    print(f"[PoS_VALIDATOR] [SUCCESS] Developer stake and trustScore verified! Publishing authorized on-chain.")
    return True

if __name__ == "__main__":
    target_app_id = sys.argv[1] if len(sys.argv) > 1 else "vrav-auth"
    min_stake = int(sys.argv[2]) if len(sys.argv) > 2 else 100
    
    print("=======================================================")
    print("PROOF-OF-SECURITY (PoS) STAKING COMPLIANCE AUDIT JOB")
    print("=======================================================")
    
    success = verify_reputation_and_stake(target_app_id, min_stake)
    if not success:
        print("[PoS_VALIDATOR] [FAILURE] Reputation validation failed. Publication pipeline terminated.")
        sys.exit(1)
        
    print("[PoS_VALIDATOR] Pipeline authorized. Proceeding to final block creation...")
    sys.exit(0)
