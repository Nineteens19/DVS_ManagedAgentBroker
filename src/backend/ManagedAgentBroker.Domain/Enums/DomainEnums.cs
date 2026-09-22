namespace ManagedAgentBroker.Domain.Enums
{
    public enum AgentType
    {
        Individual = 1,
        Corporate = 2
    }

    public enum CollateralType
    {
        CashDeposit = 1,
        BankGuarantee = 2,
        LandTitleDeed = 3,
        GuarantorOnly = 4
    }

    public enum AmloStatus
    {
        Pending = 0,
        Passed = 1,
        FlaggedPep = 2,
        RejectedDesignated = 3
    }

    public enum OicStatus
    {
        Pending = 0,
        Green = 1,
        Yellow = 2,
        Orange = 3,
        Red = 4
    }

    public enum TargetSystem
    {
        DevesMaster = 0,
        AS400 = 1,
        APAR = 2,
        SAP = 3,
        PCSDIS = 4
    }

    public enum SyncStatus
    {
        Pending = 1,
        Success = 2,
        Failed = 3,
        Retrying = 4
    }

    public enum PhysicalContractStatus
    {
        PendingBranchDispatch = 1,
        InTransit = 2,
        ReceivedLegal = 3,
        DefectNotified = 4,
        Archived = 5
    }
}
