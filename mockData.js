// Salesforce DX Data Model Mock Data for Swift Ship Tracker
// Matches Parcel__c, Sender__c, Receiver__c, and Delivery__c objects

export const initialData = {
    senders: [
        {
            id: "SND-001",
            name: "Acme Global Logistics",
            Sender_Contact__c: "+1 (555) 234-8901",
            Sender_Email__c: "dispatch@acmelogistics.com",
            Sender_Address__c: "742 Evergreen Terrace, Seattle, WA 98101, USA",
            city: "Seattle",
            lat: 47.6062,
            lng: -122.3321
        },
        {
            id: "SND-002",
            name: "Apex Electronics Corp",
            Sender_Contact__c: "+1 (555) 789-0123",
            Sender_Email__c: "fulfillment@apexelectronics.io",
            Sender_Address__c: "100 Silicon Ave, San Jose, CA 95113, USA",
            city: "San Jose",
            lat: 37.3382,
            lng: -121.8863
        },
        {
            id: "SND-003",
            name: "Nordic Artisan Goods",
            Sender_Contact__c: "+1 (555) 456-7890",
            Sender_Email__c: "support@nordicartisan.com",
            Sender_Address__c: "500 Lake Street, Chicago, IL 60601, USA",
            city: "Chicago",
            lat: 41.8781,
            lng: -87.6298
        },
        {
            id: "SND-004",
            name: "Horizon BioTech Labs",
            Sender_Contact__c: "+1 (555) 321-6540",
            Sender_Email__c: "supply@horizonbiotech.org",
            Sender_Address__c: "250 Tech Square, Boston, MA 02139, USA",
            city: "Boston",
            lat: 42.3601,
            lng: -71.0589
        }
    ],
    receivers: [
        {
            id: "REC-001",
            name: "Sophia Martinez",
            Receiver_Contact__c: "+1 (555) 912-3456",
            Receiver_Email__c: "sophia.martinez@cloudcorp.com",
            Receiver_Address__c: "350 5th Avenue, Suite 4200, New York, NY 10118, USA",
            parcelId: "TRK-849201",
            senderId: "SND-001",
            city: "New York",
            lat: 40.7128,
            lng: -74.0060
        },
        {
            id: "REC-002",
            name: "Marcus Vance",
            Receiver_Contact__c: "+1 (555) 834-1122",
            Receiver_Email__c: "marcus.vance@techinnovations.net",
            Receiver_Address__c: "1200 Grand Ave, Austin, TX 78701, USA",
            parcelId: "TRK-582019",
            senderId: "SND-002",
            city: "Austin",
            lat: 30.2672,
            lng: -97.7431
        },
        {
            id: "REC-003",
            name: "Elena Rostova",
            Receiver_Contact__c: "+1 (555) 678-9900",
            Receiver_Email__c: "elena.r@designstudios.co",
            Receiver_Address__c: "800 Biscayne Blvd, Miami, FL 33132, USA",
            parcelId: "TRK-109283",
            senderId: "SND-003",
            city: "Miami",
            lat: 25.7617,
            lng: -80.1918
        },
        {
            id: "REC-004",
            name: "David K. Chen",
            Receiver_Contact__c: "+1 (555) 443-8877",
            Receiver_Email__c: "david.chen@califoundry.com",
            Receiver_Address__c: "450 Sutter St, San Francisco, CA 94108, USA",
            parcelId: "TRK-741902",
            senderId: "SND-004",
            city: "San Francisco",
            lat: 37.7749,
            lng: -122.4194
        }
    ],
    parcels: [
        {
            id: "TRK-849201",
            name: "High-Priority Server Components",
            Parcel_ID__c: "TRK-849201",
            Sender__c: "SND-001",
            Weight__c: 14.5,
            Status__c: "In Transit",
            Estimated_Delivery_Date__c: "2026-10-06",
            bookingDate: "2026-10-02",
            serviceType: "Swift Express Air",
            route: [
                { title: "Package Booked & Label Created", location: "Seattle Fulfillment Hub, WA", time: "Oct 02, 2026 - 08:30 AM", status: "completed", lat: 47.6062, lng: -122.3321 },
                { title: "Processed at Regional Sort Facility", location: "Pacific NW Sorting Center, WA", time: "Oct 02, 2026 - 04:15 PM", status: "completed", lat: 47.4502, lng: -122.3088 },
                { title: "Departed Air Freight Hub", location: "SeaTac Logistics Terminal", time: "Oct 03, 2026 - 01:20 AM", status: "completed", lat: 45.5152, lng: -122.6784 },
                { title: "Arrived at Intermediate Transit Hub", location: "O'Hare Logistics Center, Chicago, IL", time: "Oct 04, 2026 - 09:45 AM", status: "current", lat: 41.8781, lng: -87.6298 },
                { title: "Customs & Security Cleared", location: "New York Metro Gateway, NY", time: "Pending", status: "upcoming", lat: 40.6413, lng: -73.7781 },
                { title: "Out for Delivery by Courier", location: "Manhattan Local Depot, NY", time: "Expected Oct 06, 2026 - Morning", status: "upcoming", lat: 40.7128, lng: -74.0060 },
                { title: "Delivered to Recipient", location: "350 5th Avenue, Suite 4200, New York, NY", time: "Expected Oct 06, 2026 - 03:00 PM", status: "upcoming", lat: 40.7128, lng: -74.0060 }
            ]
        },
        {
            id: "TRK-582019",
            name: "Microprocessor Development Kit",
            Parcel_ID__c: "TRK-582019",
            Sender__c: "SND-002",
            Weight__c: 3.2,
            Status__c: "Out for Delivery",
            Estimated_Delivery_Date__c: "2026-10-04",
            bookingDate: "2026-10-01",
            serviceType: "Swift Ground Priority",
            route: [
                { title: "Shipment Registered", location: "San Jose Tech Depot, CA", time: "Oct 01, 2026 - 10:00 AM", status: "completed", lat: 37.3382, lng: -121.8863 },
                { title: "In Transit across State Border", location: "Phoenix Regional Hub, AZ", time: "Oct 02, 2026 - 02:45 PM", status: "completed", lat: 33.4484, lng: -112.0740 },
                { title: "Arrived at Local Destination Facility", location: "Austin Central Hub, TX", time: "Oct 03, 2026 - 11:15 PM", status: "completed", lat: 30.2672, lng: -97.7431 },
                { title: "With Delivery Courier in Van #402", location: "Austin Downtown Sector, TX", time: "Oct 04, 2026 - 08:15 AM", status: "current", lat: 30.2747, lng: -97.7404 },
                { title: "Delivered to Recipient", location: "1200 Grand Ave, Austin, TX", time: "Today by 02:00 PM", status: "upcoming", lat: 30.2672, lng: -97.7431 }
            ]
        },
        {
            id: "TRK-109283",
            name: "Handcrafted Ceramic Set",
            Parcel_ID__c: "TRK-109283",
            Sender__c: "SND-003",
            Weight__c: 8.7,
            Status__c: "Delivered",
            Estimated_Delivery_Date__c: "2026-10-03",
            bookingDate: "2026-09-29",
            serviceType: "Swift Fragile Care",
            route: [
                { title: "Package Received & Inspected", location: "Chicago Artisan Depot, IL", time: "Sep 29, 2026 - 11:30 AM", status: "completed", lat: 41.8781, lng: -87.6298 },
                { title: "Transferred via Secure Freight", location: "Atlanta Logistics Junction, GA", time: "Oct 01, 2026 - 06:15 PM", status: "completed", lat: 33.7490, lng: -84.3880 },
                { title: "Arrived at Miami Coast Facility", location: "Miami Port Sorting, FL", time: "Oct 02, 2026 - 09:20 AM", status: "completed", lat: 25.7617, lng: -80.1918 },
                { title: "Out for Delivery", location: "Miami Downtown, FL", time: "Oct 03, 2026 - 08:45 AM", status: "completed", lat: 25.7617, lng: -80.1918 },
                { title: "Delivered & Signed by Elena Rostova", location: "800 Biscayne Blvd, Miami, FL", time: "Oct 03, 2026 - 01:22 PM", status: "completed", lat: 25.7617, lng: -80.1918 }
            ]
        },
        {
            id: "TRK-741902",
            name: "Bio-Reagents Sample Cooler",
            Parcel_ID__c: "TRK-741902",
            Sender__c: "SND-004",
            Weight__c: 5.0,
            Status__c: "Booked",
            Estimated_Delivery_Date__c: "2026-10-08",
            bookingDate: "2026-10-04",
            serviceType: "Swift ColdChain Express",
            route: [
                { title: "Booking Confirmed & QR Assigned", location: "Boston BioTech Depot, MA", time: "Oct 04, 2026 - 07:15 AM", status: "current", lat: 42.3601, lng: -71.0589 },
                { title: "Scheduled Carrier Pickup", location: "250 Tech Square, Cambridge, MA", time: "Oct 04, 2026 - 02:00 PM", status: "upcoming", lat: 42.3601, lng: -71.0589 },
                { title: "Cold Storage Air Transit", location: "Logan International Cargo, MA", time: "Oct 05, 2026", status: "upcoming", lat: 42.3656, lng: -71.0096 },
                { title: "Arrival at Bay Area Hub", location: "SFO Air Freight Hub, CA", time: "Oct 07, 2026", status: "upcoming", lat: 37.6213, lng: -122.3790 },
                { title: "Final Cold Delivery", location: "450 Sutter St, San Francisco, CA", time: "Expected Oct 08, 2026", status: "upcoming", lat: 37.7749, lng: -122.4194 }
            ]
        }
    ],
    deliveries: [
        {
            id: "DEL-9001",
            name: "Delivery Run #9001",
            Parcel__c: "TRK-849201",
            Sender__c: "SND-001",
            Current_Location__c: "O'Hare Logistics Center, Chicago, IL (Lat: 41.8781, Lng: -87.6298)",
            Estimated_Delivery_Date__c: "2026-10-06",
            driver: "David Miller (Fleet #88)",
            driverPhone: "+1 (555) 777-1010",
            vehicle: "Swift Air Carrier (Flight SW-492)"
        },
        {
            id: "DEL-9002",
            name: "Delivery Run #9002",
            Parcel__c: "TRK-582019",
            Sender__c: "SND-002",
            Current_Location__c: "Austin Downtown Sector, TX (Lat: 30.2747, Lng: -97.7404)",
            Estimated_Delivery_Date__c: "2026-10-04",
            driver: "Carlos Santana (Van #402)",
            driverPhone: "+1 (555) 777-2020",
            vehicle: "Swift Electric Van EV-402"
        },
        {
            id: "DEL-9003",
            name: "Delivery Run #9003",
            Parcel__c: "TRK-109283",
            Sender__c: "SND-003",
            Current_Location__c: "800 Biscayne Blvd, Miami, FL (Delivered)",
            Estimated_Delivery_Date__c: "2026-10-03",
            driver: "Maria Garcia (Van #119)",
            driverPhone: "+1 (555) 777-3030",
            vehicle: "Swift Delivery Van"
        },
        {
            id: "DEL-9004",
            name: "Delivery Run #9004",
            Parcel__c: "TRK-741902",
            Sender__c: "SND-004",
            Current_Location__c: "Boston BioTech Depot, MA (Awaiting Pickup)",
            Estimated_Delivery_Date__c: "2026-10-08",
            driver: "Unassigned (Dispatched Soon)",
            driverPhone: "N/A",
            vehicle: "Swift Cold-Chain Unit"
        }
    ]
};
