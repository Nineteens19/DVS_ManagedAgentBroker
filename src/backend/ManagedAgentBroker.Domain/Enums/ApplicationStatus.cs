namespace ManagedAgentBroker.Domain.Enums
{
    public enum ApplicationStatus
    {
        Draft = 1,
        SubmittedBranch = 2,
        ReviewHeadOffice = 3,
        PendingExecutiveApproval = 4,
        ReviewPremium = 5,
        CoreAutoProvisioning = 6,
        ActiveTemporary = 7,         // เปิดขายชั่วคราว (Provisional Selling Active)
        ReviewLegalOriginal = 8,
        ActivePermanent = 9,         // เปิดขายถาวร (Permanent Selling Rights)
        Suspended30D = 10,           // ระงับการส่งงาน Auto (30-day SLA breach)
        Terminated90D = 11,          // ปิดรหัสถาวร Auto (90-day SLA expiration)
        ReturnedForCorrection = 12,  // ส่งกลับแก้ไขตาม Reject Checklist
        ExecutiveRejected = 13,
        ComplianceRejected = 14
    }
}
