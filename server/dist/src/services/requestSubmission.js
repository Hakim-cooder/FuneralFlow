export function resolveRequestSubmissionContext(input) {
    const role = input.user?.role || '';
    const isWalkIn = role === 'ORGANIZER' || role === 'SUPER_ADMIN';
    if (!isWalkIn) {
        return {
            familyMemberId: input.familyMemberRow?.id || null,
            submittedInPerson: false,
            contactName: null,
            contactPhone: null,
        };
    }
    const contactName = String(input.contactName || '').trim();
    const contactPhone = String(input.contactPhone || '').trim();
    if (!contactName || !contactPhone) {
        throw new Error('Walk-in requests require a contact name and phone number.');
    }
    return {
        familyMemberId: null,
        submittedInPerson: true,
        contactName,
        contactPhone,
    };
}
