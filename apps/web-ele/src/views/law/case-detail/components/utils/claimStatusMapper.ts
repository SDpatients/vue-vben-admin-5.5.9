export const getRegistrationStatusTag = (status: string) => {
  const statusMap: Record<string, any> = {
    PENDING: { type: 'warning', text: '待处理' },
    REVIEWING: { type: 'primary', text: '审查中' },
    REVIEW_COMPLETED: { type: 'success', text: '审查完成' },
    CONFIRMING: { type: 'info', text: '确认中' },
    CONFIRMED: { type: 'success', text: '确认完成' },
    REGISTERED: { type: 'success', text: '已登记' },
    REJECTED: { type: 'danger', text: '已驳回' },
  };
  return statusMap[status] || { type: 'info', text: '未知' };
};

export const getReviewStatusTag = (status: string) => {
  const statusMap: Record<string, any> = {
    PENDING: { type: 'warning', text: '待审查' },
    IN_PROGRESS: { type: 'primary', text: '审查中' },
    COMPLETED: { type: 'success', text: '已完成' },
    SUPPLEMENT: { type: 'danger', text: '待补充' },
    CONFIRMING: { type: 'info', text: '确认中' },
  };
  return statusMap[status] || { type: 'info', text: status };
};

export const getConfirmationStatusTag = (status: string) => {
  const statusMap: Record<string, any> = {
    PENDING: { type: 'warning', text: '待确认' },
    IN_PROGRESS: { type: 'primary', text: '确认中' },
    CONFIRMED: { type: 'success', text: '已确认' },
    OBJECTION: { type: 'danger', text: '有异议' },
    COURT: { type: 'primary', text: '法院裁定' },
    LAWSUIT: { type: 'info', text: '诉讼中' },
  };
  return statusMap[status] || { type: 'info', text: status };
};

export const getMaterialCompletenessTag = (completeness: string) => {
  const statusMap: Record<string, any> = {
    COMPLETE: { type: 'success', text: '完整' },
    INCOMPLETE: { type: 'warning', text: '不完整' },
    PENDING: { type: 'info', text: '待补充' },
  };
  return statusMap[completeness] || { type: 'info', text: completeness };
};

export const getReviewConclusionTag = (conclusion: string) => {
  const conclusionMap: Record<string, any> = {
    CONFIRMED: { type: 'success', text: '确认' },
    PARTIAL_CONFIRMED: { type: 'warning', text: '部分确认' },
    UNCONFIRMED: { type: 'danger', text: '不予确认' },
  };
  return conclusionMap[conclusion] || { type: 'info', text: conclusion };
};

export const getClaimStageStatus = (row: any) => {
  const registrationStatus = row.registration_status;

  if (registrationStatus === 'PENDING') {
    return { stage: 1, label: '待处理', type: 'warning' };
  } else if (registrationStatus === 'REVIEWING') {
    return { stage: 2, label: '审查中', type: 'primary' };
  } else if (registrationStatus === 'REVIEW_COMPLETED') {
    return { stage: 2, label: '审查完成', type: 'success' };
  } else if (registrationStatus === 'CONFIRMING') {
    return { stage: 3, label: '确认中', type: 'info' };
  } else if (registrationStatus === 'CONFIRMED') {
    return { stage: 3, label: '确认完成', type: 'success' };
  } else if (registrationStatus === 'REGISTERED') {
    return { stage: 1, label: '已登记', type: 'success' };
  } else if (registrationStatus === 'REJECTED') {
    return { stage: 0, label: '已驳回', type: 'danger' };
  }
  return { stage: 0, label: '未知', type: 'info' };
};
