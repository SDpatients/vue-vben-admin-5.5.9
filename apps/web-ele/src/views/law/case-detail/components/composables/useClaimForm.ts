import type { ClaimRegistrationApi } from '#/api/core/claim-registration';
import type { ClaimReviewApi } from '#/api/core/claim-review';

import { computed, reactive } from 'vue';

export function useClaimForm() {
  const claimForm = reactive({
    caseName: '',
    debtor: '',
    account: '',
    creditorName: '',
    creditorType: '',
    creditCode: '',
    legalRepresentative: '',
    serviceAddress: '',
    agentName: '',
    agentPhone: '',
    agentIdCard: '',
    agentAddress: '',
    accountName: '',
    bankAccount: '',
    bankName: '',
    principal: '',
    interest: '',
    penalty: '',
    otherLosses: '',
    totalAmount: '',
    hasCourtJudgment: false,
    hasExecution: false,
    hasCollateral: false,
    claimNature: '',
    claimType: '',
    claimFacts: '',
    claimIdentifier: '',
    evidenceList: '',
    evidenceMaterials: '',
    evidenceAttachments: [] as number[],
    registrationDate: '',
    registrationDeadline: '',
    materialReceiver: '',
    materialReceiveDate: '',
    materialCompleteness: 'COMPLETE' as ClaimRegistrationApi.MaterialCompleteness,
    remarks: '',
    registrationStatus: 'PENDING' as ClaimRegistrationApi.RegistrationStatus,
    creditorCategory: '',
    claimNatureManager: '',
  });

  const totalAmount = computed(() => {
    const principal = Number.parseFloat(claimForm.principal) || 0;
    const interest = Number.parseFloat(claimForm.interest) || 0;
    const penalty = Number.parseFloat(claimForm.penalty) || 0;
    const otherLosses = Number.parseFloat(claimForm.otherLosses) || 0;
    const total =
      Math.round((principal + interest + penalty + otherLosses) * 100) / 100;
    return total.toFixed(2);
  });

  const resetClaimForm = () => {
    claimForm.caseName = '';
    claimForm.debtor = '';
    claimForm.account = '';
    claimForm.creditorName = '';
    claimForm.creditorType = '';
    claimForm.creditCode = '';
    claimForm.legalRepresentative = '';
    claimForm.serviceAddress = '';
    claimForm.agentName = '';
    claimForm.agentPhone = '';
    claimForm.agentIdCard = '';
    claimForm.agentAddress = '';
    claimForm.accountName = '';
    claimForm.bankAccount = '';
    claimForm.bankName = '';
    claimForm.principal = '';
    claimForm.interest = '';
    claimForm.penalty = '';
    claimForm.otherLosses = '';
    claimForm.totalAmount = '';
    claimForm.hasCourtJudgment = false;
    claimForm.hasExecution = false;
    claimForm.hasCollateral = false;
    claimForm.claimNature = '';
    claimForm.claimType = '';
    claimForm.claimFacts = '';
    claimForm.claimIdentifier = '';
    claimForm.evidenceList = '';
    claimForm.evidenceMaterials = '';
    claimForm.evidenceAttachments = [] as number[];
    claimForm.registrationDate = '';
    claimForm.registrationDeadline = '';
    claimForm.materialReceiver = '';
    claimForm.materialReceiveDate = '';
    claimForm.materialCompleteness = 'COMPLETE';
    claimForm.remarks = '';
    claimForm.registrationStatus = 'PENDING';
    claimForm.creditorCategory = '';
    claimForm.claimNatureManager = '';
  };

  return {
    claimForm,
    totalAmount,
    resetClaimForm,
  };
}

export function useReviewForm() {
  const reviewForm = reactive({
    reviewDate: '',
    reviewer: '',
    reviewRound: 1,
    reviewBasis: '',
    declaredPrincipal: 0,
    declaredInterest: 0,
    declaredPenalty: 0,
    declaredOtherLosses: 0,
    declaredTotalAmount: 0,
    confirmedPrincipal: 0,
    confirmedInterest: 0,
    confirmedPenalty: 0,
    confirmedOtherLosses: 0,
    confirmedTotalAmount: 0,
    unconfirmedPrincipal: 0,
    unconfirmedInterest: 0,
    unconfirmedPenalty: 0,
    unconfirmedOtherLosses: 0,
    unconfirmedTotalAmount: 0,
    adjustmentReason: '',
    unconfirmedReason: '',
    insufficientEvidenceReason: '',
    expiredReason: '',
    evidenceAuthenticity: 'AUTHENTIC' as ClaimReviewApi.EvidenceAuthenticity,
    evidenceRelevance: 'RELEVANT' as ClaimReviewApi.EvidenceRelevance,
    evidenceLegality: 'LEGAL' as ClaimReviewApi.EvidenceLegality,
    evidenceReviewNotes: '',
    confirmedClaimNature: '',
    isJointLiability: false,
    isConditional: false,
    isTerm: false,
    collateralType: '',
    collateralProperty: '',
    collateralAmount: 0,
    collateralTerm: '',
    collateralValidity: 'VALID' as ClaimReviewApi.CollateralValidity,
    reviewConclusion: 'CONFIRMED' as ClaimReviewApi.ReviewConclusion,
    reviewSummary: '',
    reviewReport: '',
    reviewAttachments: [] as number[],
    reviewStatus: 'COMPLETED' as ClaimReviewApi.ReviewStatus,
    remarks: '',
  });

  const declaredTotalAmount = computed(() => {
    const principal = Number(reviewForm.declaredPrincipal) || 0;
    const interest = Number(reviewForm.declaredInterest) || 0;
    const penalty = Number(reviewForm.declaredPenalty) || 0;
    const otherLosses = Number(reviewForm.declaredOtherLosses) || 0;
    const total =
      Math.round((principal + interest + penalty + otherLosses) * 100) / 100;
    return total.toFixed(2);
  });

  const confirmedTotalAmount = computed(() => {
    const principal = Number(reviewForm.confirmedPrincipal) || 0;
    const interest = Number(reviewForm.confirmedInterest) || 0;
    const penalty = Number(reviewForm.confirmedPenalty) || 0;
    const otherLosses = Number(reviewForm.confirmedOtherLosses) || 0;
    const total =
      Math.round((principal + interest + penalty + otherLosses) * 100) / 100;
    return total.toFixed(2);
  });

  const unconfirmedTotalAmount = computed(() => {
    const principal = Number(reviewForm.unconfirmedPrincipal) || 0;
    const interest = Number(reviewForm.unconfirmedInterest) || 0;
    const penalty = Number(reviewForm.unconfirmedPenalty) || 0;
    const otherLosses = Number(reviewForm.unconfirmedOtherLosses) || 0;
    const total =
      Math.round((principal + interest + penalty + otherLosses) * 100) / 100;
    return total.toFixed(2);
  });

  const resetReviewForm = () => {
    Object.assign(reviewForm, {
      reviewDate: '',
      reviewer: '',
      reviewRound: 1,
      reviewBasis: '',
      declaredPrincipal: 0,
      declaredInterest: 0,
      declaredPenalty: 0,
      declaredOtherLosses: 0,
      declaredTotalAmount: 0,
      confirmedPrincipal: 0,
      confirmedInterest: 0,
      confirmedPenalty: 0,
      confirmedOtherLosses: 0,
      confirmedTotalAmount: 0,
      unconfirmedPrincipal: 0,
      unconfirmedInterest: 0,
      unconfirmedPenalty: 0,
      unconfirmedOtherLosses: 0,
      unconfirmedTotalAmount: 0,
      adjustmentReason: '',
      unconfirmedReason: '',
      insufficientEvidenceReason: '',
      expiredReason: '',
      evidenceAuthenticity: 'AUTHENTIC' as ClaimReviewApi.EvidenceAuthenticity,
      evidenceRelevance: 'RELEVANT' as ClaimReviewApi.EvidenceRelevance,
      evidenceLegality: 'LEGAL' as ClaimReviewApi.EvidenceLegality,
      evidenceReviewNotes: '',
      confirmedClaimNature: '',
      isJointLiability: false,
      isConditional: false,
      isTerm: false,
      collateralType: '',
      collateralProperty: '',
      collateralAmount: 0,
      collateralTerm: '',
      collateralValidity: 'VALID' as ClaimReviewApi.CollateralValidity,
      reviewConclusion: 'CONFIRMED' as ClaimReviewApi.ReviewConclusion,
      reviewSummary: '',
      reviewReport: '',
      reviewAttachments: [] as number[],
      reviewStatus: 'COMPLETED' as ClaimReviewApi.ReviewStatus,
      remarks: '',
    });
  };

  return {
    reviewForm,
    declaredTotalAmount,
    confirmedTotalAmount,
    unconfirmedTotalAmount,
    resetReviewForm,
  };
}

export function useConfirmationForm() {
  const confirmationForm = reactive({
    meetingType: 'FIRST' as 'FIRST' | 'SECOND' | 'TEMPORARY',
    meetingDate: '',
    meetingLocation: '',
    voteResult: 'AGREE' as 'AGREE' | 'DISAGREE' | 'ABSTAIN',
    voteNotes: '',
    hasObjection: false,
    objector: '',
    objectionReason: '',
    objectionAmount: 0,
    objectionDate: '',
    negotiationResult: '',
    negotiationDate: '',
    negotiationParticipants: '',
    courtRulingNo: '',
    courtRulingResult: 'CONFIRMED' as 'CONFIRMED' | 'PARTIAL_CONFIRMED' | 'UNCONFIRMED',
    courtRulingAmount: 0,
    courtRulingDate: '',
    courtRulingNotes: '',
    hasLawsuit: false,
    lawsuitCaseNo: '',
    lawsuitStatus: 'PENDING' as 'PENDING' | 'TRIALING' | 'JUDGED' | 'EXECUTING' | 'COMPLETED',
    lawsuitResult: 'WIN' as 'WIN' | 'LOSE' | 'PARTIAL' | 'SETTLED',
    lawsuitAmount: 0,
    lawsuitNotes: '',
    finalConfirmedAmount: 0,
    finalConfirmationDate: '',
    finalConfirmationBasis: 'MEETING' as 'MEETING' | 'COURT' | 'SETTLEMENT' | 'OTHER',
    confirmationAttachments: [] as number[],
    confirmationStatus: 'PENDING' as 'PENDING' | 'CONFIRMED' | 'OBJECTION' | 'COURT' | 'LAWSUIT',
    remarks: '',
  });

  const finalConfirmedAmount = computed(() => {
    if (
      confirmationForm.finalConfirmationBasis === 'COURT' &&
      confirmationForm.courtRulingAmount
    ) {
      return confirmationForm.courtRulingAmount.toFixed(2);
    } else if (confirmationForm.hasLawsuit && confirmationForm.lawsuitAmount) {
      return confirmationForm.lawsuitAmount.toFixed(2);
    } else if (
      confirmationForm.hasObjection &&
      confirmationForm.objectionAmount
    ) {
      return confirmationForm.objectionAmount.toFixed(2);
    } else {
      return Number(confirmationForm.finalConfirmedAmount).toFixed(2);
    }
  });

  const resetConfirmationForm = () => {
    Object.assign(confirmationForm, {
      meetingType: 'FIRST',
      meetingDate: '',
      meetingLocation: '',
      voteResult: 'AGREE',
      voteNotes: '',
      hasObjection: false,
      objector: '',
      objectionReason: '',
      objectionAmount: 0,
      objectionDate: '',
      negotiationResult: '',
      negotiationDate: '',
      negotiationParticipants: '',
      courtRulingNo: '',
      courtRulingResult: 'CONFIRMED',
      courtRulingAmount: 0,
      courtRulingDate: '',
      courtRulingNotes: '',
      hasLawsuit: false,
      lawsuitCaseNo: '',
      lawsuitStatus: 'PENDING',
      lawsuitResult: 'WIN',
      lawsuitAmount: 0,
      lawsuitNotes: '',
      finalConfirmedAmount: 0,
      finalConfirmationDate: '',
      finalConfirmationBasis: 'MEETING',
      confirmationAttachments: [] as number[],
      confirmationStatus: 'PENDING',
      remarks: '',
    });
  };

  return {
    confirmationForm,
    finalConfirmedAmount,
    resetConfirmationForm,
  };
}
