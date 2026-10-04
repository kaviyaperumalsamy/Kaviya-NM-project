// Agentforce AI Prompt Simulator
// Corresponds to Salesforce Flow: Parcel_Details.flow-meta.xml
// Action: generatePromptResponse (Retrieve_Parcel_Details)

export function simulateAgentforceResponse(query, dataStore) {
    const q = query.trim().toLowerCase();
    
    // Look for a tracking ID in the query (e.g., TRK-849201 or numbers)
    const trkMatch = query.match(/TRK-\d{6}/i) || query.match(/\b\d{6}\b/i);
    let matchedParcel = null;

    if (trkMatch) {
        const idToFind = trkMatch[0].toUpperCase().startsWith('TRK-') ? trkMatch[0].toUpperCase() : `TRK-${trkMatch[0]}`;
        matchedParcel = dataStore.parcels.find(p => p.id === idToFind || p.Parcel_ID__c === idToFind);
    }

    // If no explicit ID, check if user asks about sender/receiver name or status
    if (!matchedParcel) {
        matchedParcel = dataStore.parcels.find(p => {
            const sender = dataStore.senders.find(s => s.id === p.Sender__c);
            const receiver = dataStore.receivers.find(r => r.parcelId === p.id);
            return (
                p.name.toLowerCase().includes(q) ||
                (sender && sender.name.toLowerCase().includes(q)) ||
                (receiver && receiver.name.toLowerCase().includes(q))
            );
        });
    }

    // Default to first active parcel if query is general like "where is my parcel?"
    if (!matchedParcel && (q.includes("where") || q.includes("status") || q.includes("track") || q.includes("parcel") || q.includes("shipment"))) {
        matchedParcel = dataStore.parcels[0];
    }

    if (!matchedParcel) {
        return {
            reply: `🤖 **Agentforce Assistant**: I searched our Salesforce repository for records matching "${query}", but couldn't locate a matching Parcel record. Try asking about **TRK-849201**, **TRK-582019**, **TRK-109283**, or **TRK-741902**.`,
            parcel: null
        };
    }

    const sender = dataStore.senders.find(s => s.id === matchedParcel.Sender__c) || {};
    const receiver = dataStore.receivers.find(r => r.parcelId === matchedParcel.id) || {};
    const delivery = dataStore.deliveries.find(d => d.Parcel__c === matchedParcel.id) || {};
    const currentStep = matchedParcel.route.find(r => r.status === 'current') || matchedParcel.route[matchedParcel.route.length - 1];

    let aiAnalysis = "";
    if (matchedParcel.Status__c === 'Delivered') {
        aiAnalysis = `✅ **Shipment Complete**: Parcel **${matchedParcel.id}** was safely delivered on **${matchedParcel.Estimated_Delivery_Date__c}** to **${receiver.name || 'the recipient'}**. Signed & verified at destination.`;
    } else if (matchedParcel.Status__c === 'Out for Delivery') {
        aiAnalysis = `🚚 **On Courier Vehicle**: Parcel **${matchedParcel.id}** is currently on the delivery vehicle with driver **${delivery.driver || 'Assigned Courier'}** in **${delivery.Current_Location__c || receiver.city}**. Expected arrival today!`;
    } else if (matchedParcel.Status__c === 'In Transit') {
        aiAnalysis = `✈️ **In Transit**: Parcel **${matchedParcel.id}** is moving smoothly through **${currentStep.location}**. Estimated delivery is on schedule for **${matchedParcel.Estimated_Delivery_Date__c}**.`;
    } else {
        aiAnalysis = `📦 **Booked & Label Created**: Parcel **${matchedParcel.id}** is queued for dispatch at **${sender.city || 'Origin'}**. Scheduled to depart shortly.`;
    }

    const reply = `
### ⚡ Salesforce Agentforce Vibes — Flow Execution Result
*Generated via Flow: \`Parcel_Details\` (Action: \`Retrieve_Parcel_Details\`)*

${aiAnalysis}

---
**📋 Salesforce Record Summary (`Parcel__c`):**
- **Tracking ID:** \`${matchedParcel.Parcel_ID__c}\` (${matchedParcel.name})
- **Current Status:** \`${matchedParcel.Status__c}\`
- **Weight:** ${matchedParcel.Weight__c} kg
- **Estimated Delivery:** **${matchedParcel.Estimated_Delivery_Date__c}**
- **Current Checkpoint:** ${currentStep.location} (${currentStep.time})

**📍 Origin & Destination:**
- **Sender (\`Sender__c\`):** ${sender.name || 'N/A'} — *${sender.Sender_Address__c || 'N/A'}*
- **Receiver (\`Receiver__c\`):** ${receiver.name || 'N/A'} — *${receiver.Receiver_Address__c || 'N/A'}*
- **Assigned Delivery Fleet (\`Delivery__c\`):** ${delivery.name || 'N/A'} (${delivery.vehicle || 'Standard Carrier'})
    `.trim();

    return {
        reply,
        parcel: matchedParcel
    };
}
