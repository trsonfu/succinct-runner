// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import { ISP1Verifier } from "../lib/sp1-contracts/ISP1Verifier.sol";

contract GameScoreRecorder {
    address public verifier;
    bytes32 public gameScoreProgramVKey;

    event ScoreRecorded(uint256 score);

    constructor(address _verifier, bytes32 _gameScoreProgramVKey) {
        verifier = _verifier;
        gameScoreProgramVKey = _gameScoreProgramVKey;
    }

    // SP1 증명을 검증하고 점수를 기록하는 함수
    function recordScore(bytes calldata publicValues, bytes calldata proofBytes) external {
        // SP1 증명 검증: 검증이 실패하면 트랜잭션은 revert됩니다.
        ISP1Verifier(verifier).verifyProof(gameScoreProgramVKey, publicValues, proofBytes);
        
        // publicValues로부터 점수를 디코딩합니다.
        (uint256 score) = abi.decode(publicValues, (uint256));

        // 점수를 저장하거나 이벤트를 발생시킵니다.
        emit ScoreRecorded(score);
    }
}
