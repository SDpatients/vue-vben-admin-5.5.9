export const claimFormRules = {
  creditorName: [
    { required: true, message: '请输入债权人姓名或名称', trigger: 'blur' },
  ],
  creditorType: [
    { required: true, message: '请选择债权人类型', trigger: 'change' },
  ],
  creditCode: [
    {
      pattern: /^[0-9A-HJ-NPQRTUWXY]{2}\d{6}[0-9A-HJ-NPQRTUWXY]{10}$/,
      message: '请输入正确的统一社会信用代码',
      trigger: 'blur',
    },
  ],
  claimType: [{ required: true, message: '请选择债权种类', trigger: 'change' }],
  principal: [
    {
      pattern: /^\d+(\.\d{1,2})?$/,
      message: '请输入正确的金额',
      trigger: 'blur',
    },
  ],
  interest: [
    {
      pattern: /^\d+(\.\d{1,2})?$/,
      message: '请输入正确的金额',
      trigger: 'blur',
    },
  ],
  penalty: [
    {
      pattern: /^\d+(\.\d{1,2})?$/,
      message: '请输入正确的金额',
      trigger: 'blur',
    },
  ],
  otherLosses: [
    {
      pattern: /^\d+(\.\d{1,2})?$/,
      message: '请输入正确的金额',
      trigger: 'blur',
    },
  ],
  agentPhone: [
    {
      pattern: /^1[3-9]\d{9}$/,
      message: '请输入正确的手机号码',
      trigger: 'blur',
    },
  ],
  agentIdCard: [
    {
      pattern: /(^\d{15}$)|(^\d{18}$)|(^\d{17}X$)/,
      message: '请输入正确的身份证号码',
      trigger: 'blur',
    },
  ],
};

export const reviewFormRules = {
  reviewConclusion: [
    { required: true, message: '请选择审查结论', trigger: 'change' },
  ],
  reviewDate: [
    { required: true, message: '请选择审查日期', trigger: 'change' },
  ],
  reviewer: [
    { required: true, message: '请输入审查人', trigger: 'blur' },
  ],
};

export const confirmationFormRules = {
  meetingDate: [
    { required: true, message: '请选择会议日期', trigger: 'change' },
  ],
  voteResult: [
    { required: true, message: '请选择表决结果', trigger: 'change' },
  ],
  finalConfirmedAmount: [
    {
      pattern: /^\d+(\.\d{1,2})?$/,
      message: '请输入正确的金额',
      trigger: 'blur',
    },
  ],
};
