import { 
  User, 
  Species, 
  BiodiversityRecord, 
  ConservationProject, 
  ThreatProposal, 
  NotificationItem, 
  AuditLogEntry, 
  WatchlistSubscription 
} from '../types/index.js';

export const SEED_USERS: User[] = [
  {
    userId: 'usr_sci_01',
    name: 'Dr. Elena Rostova',
    email: 'elena.rostova@biotrust.org',
    password: 'password123',
    role: 'SCIENTIST',
    status: 'ACTIVE',
    organizationName: 'Global Wildlife Genetics Institute',
    reputationScore: 94,
    expertiseTags: ['Mammalia', 'Panthera', 'Genomics', 'Carnivora', 'Forest'],
    createdAt: '2025-01-15T08:00:00Z'
  },
  {
    userId: 'usr_sci_02',
    name: 'Dr. Aarav Patel',
    email: 'aarav.patel@biotrust.org',
    password: 'password123',
    role: 'SCIENTIST',
    status: 'ACTIVE',
    organizationName: 'Oceanic & Marine Biodiversity Labs',
    reputationScore: 89,
    expertiseTags: ['Cetacea', 'Marine', 'Balaenoptera', 'eDNA', 'Conservation'],
    createdAt: '2025-02-10T09:30:00Z'
  },
  {
    userId: 'usr_rev_01',
    name: 'Prof. Thandiwe Moyo',
    email: 'thandiwe.moyo@biotrust.org',
    password: 'password123',
    role: 'REVIEWER',
    status: 'ACTIVE',
    organizationName: 'African Biodiversity Review Board',
    reputationScore: 98,
    expertiseTags: ['Mammalia', 'Taxonomy', 'Panthera', 'Primates', 'Ecology'],
    createdAt: '2024-11-01T10:00:00Z'
  },
  {
    userId: 'usr_rev_02',
    name: 'Dr. Lucas Vance',
    email: 'lucas.vance@biotrust.org',
    password: 'password123',
    role: 'REVIEWER',
    status: 'ACTIVE',
    organizationName: 'Cambridge Conservation Genomic Center',
    reputationScore: 92,
    expertiseTags: ['Genetics', 'eDNA', 'Cetacea', 'Lepidoptera', 'Endangered Species'],
    createdAt: '2024-12-05T11:15:00Z'
  },
  {
    userId: 'usr_org_01',
    name: 'Sarah Jenkins',
    email: 'sarah.jenkins@wildearth.org',
    password: 'password123',
    role: 'ORGANIZATION',
    status: 'ACTIVE',
    organizationName: 'WildEarth Conservation Alliance',
    reputationScore: 88,
    expertiseTags: ['Habitat Protection', 'Corridors', 'Community Action'],
    createdAt: '2025-01-20T14:00:00Z'
  },
  {
    userId: 'usr_gov_01',
    name: 'Marcus Sterling',
    email: 'marcus.sterling@wildlife.gov',
    password: 'password123',
    role: 'GOVERNMENT',
    status: 'ACTIVE',
    organizationName: 'National Wildlife Protection Agency',
    reputationScore: 95,
    expertiseTags: ['Policy', 'CITES', 'IUCN Legislation', 'Protected Zones'],
    createdAt: '2024-09-15T09:00:00Z'
  },
  {
    userId: 'usr_adm_01',
    name: 'Admin Commander Alex Chen',
    email: 'admin@biotrust.org',
    password: 'password123',
    role: 'ADMIN',
    status: 'ACTIVE',
    organizationName: 'BioTrust Global Operations',
    reputationScore: 100,
    expertiseTags: ['Security', 'Identity', 'System Architecture', 'Governance'],
    createdAt: '2024-08-01T00:00:00Z'
  },
  {
    userId: 'usr_pub_01',
    name: 'Jordan Rivera',
    email: 'jordan.rivera@gmail.com',
    password: 'password123',
    role: 'PUBLIC',
    status: 'ACTIVE',
    reputationScore: 50,
    expertiseTags: ['Citizen Science', 'Bird Watching'],
    createdAt: '2025-03-01T12:00:00Z'
  }
];

export const SEED_SPECIES: Species[] = [
  {
    speciesId: 'spc_001',
    commonName: 'Bengal Tiger',
    scientificName: 'Panthera tigris tigris',
    kingdom: 'Animalia',
    phylum: 'Chordata',
    class: 'Mammalia',
    order: 'Carnivora',
    family: 'Felidae',
    genus: 'Panthera',
    description: 'The Bengal tiger is a majestic apex predator inhabiting tropical and subtropical moist broadleaf forests, alluvial grasslands, and mangrove swamps across South Asia.',
    habitat: 'Mangroves & Moist Broadleaf Forests',
    distribution: 'Sundarbans, Western Ghats, Terai Arc',
    threatLevel: 'Critically Endangered',
    isProtected: true,
    threatFactors: ['Poaching', 'Habitat Fragmentation', 'Human-Wildlife Conflict', 'Climate Inundation'],
    imageUrl: 'https://images.unsplash.com/photo-1561731216-c3a4d99437d5?auto=format&fit=crop&w=600&q=80',
    updatedAt: '2026-02-15T10:00:00Z'
  },
  {
    speciesId: 'spc_002',
    commonName: 'Javan Rhinoceros',
    scientificName: 'Rhinoceros sondaicus',
    kingdom: 'Animalia',
    phylum: 'Chordata',
    class: 'Mammalia',
    order: 'Perissodactyla',
    family: 'Rhinocerotidae',
    genus: 'Rhinoceros',
    description: 'The Javan rhinoceros is one of the rarest large mammals on Earth, characterized by a single horn and armor-like mosaic skin folds.',
    habitat: 'Dense Lowland Tropical Rainforest',
    distribution: 'Ujung Kulon National Park, Java, Indonesia',
    threatLevel: 'Critically Endangered',
    isProtected: true,
    threatFactors: ['Extremely Low Genetic Diversity', 'Natural Catastrophes (Tsunamis)', 'Disease', 'Poaching'],
    imageUrl: 'https://images.unsplash.com/photo-1534567153574-2b12153a87f0?auto=format&fit=crop&w=600&q=80',
    updatedAt: '2026-01-20T11:30:00Z'
  },
  {
    speciesId: 'spc_003',
    commonName: 'Blue Whale',
    scientificName: 'Balaenoptera musculus',
    kingdom: 'Animalia',
    phylum: 'Chordata',
    class: 'Mammalia',
    order: 'Artiodactyla',
    family: 'Balaenopteridae',
    genus: 'Balaenoptera',
    description: 'The largest animal ever known to have lived on Earth. Blue whales communicate across vast oceanic basins using ultra-low-frequency infrasound.',
    habitat: 'Pelagic Ocean & Polar Feeding Grounds',
    distribution: 'North Atlantic, North Pacific, Southern Ocean',
    threatLevel: 'Endangered',
    isProtected: true,
    threatFactors: ['Ship Strikes', 'Ocean Acoustic Noise', 'Krill Biomass Depletion', 'Entanglement'],
    imageUrl: 'https://images.unsplash.com/photo-1568430462989-44163eb1752f?auto=format&fit=crop&w=600&q=80',
    updatedAt: '2026-03-01T14:20:00Z'
  },
  {
    speciesId: 'spc_004',
    commonName: 'Monarch Butterfly',
    scientificName: 'Danaus plexippus',
    kingdom: 'Animalia',
    phylum: 'Arthropoda',
    class: 'Insecta',
    order: 'Lepidoptera',
    family: 'Nymphalidae',
    genus: 'Danaus',
    description: 'Renowned for its incredible multi-generational transcontinental migration spanning thousands of kilometers across North America.',
    habitat: 'Meadows, Grasslands & Oyamel Fir Forests',
    distribution: 'North & Central America, Pacific Islands',
    threatLevel: 'Vulnerable',
    isProtected: false,
    threatFactors: ['Milkweed Eradication', 'Pesticide Exposure', 'Overwintering Forest Deforestation'],
    imageUrl: 'https://images.unsplash.com/photo-1544943910-4c1dc44a04d5?auto=format&fit=crop&w=600&q=80',
    updatedAt: '2026-02-28T09:15:00Z'
  },
  {
    speciesId: 'spc_005',
    commonName: 'Mountain Gorilla',
    scientificName: 'Gorilla beringei beringei',
    kingdom: 'Animalia',
    phylum: 'Chordata',
    class: 'Mammalia',
    order: 'Primates',
    family: 'Hominidae',
    genus: 'Gorilla',
    description: 'A subspecies of the eastern gorilla living in cloud forests on volcanic slopes, exhibiting complex social troops led by dominant silverbacks.',
    habitat: 'Montane Cloud Rainforest (2,200m - 4,300m)',
    distribution: 'Virunga Volcanic Mountains & Bwindi Impenetrable Forest',
    threatLevel: 'Endangered',
    isProtected: true,
    threatFactors: ['Habitat Encroachment', 'Respiratory Pathogens', 'Armed Conflict Zones', 'Snare Bycatch'],
    imageUrl: 'https://images.unsplash.com/photo-1540573133985-87b6da6d54a9?auto=format&fit=crop&w=600&q=80',
    updatedAt: '2026-03-10T16:45:00Z'
  },
  {
    speciesId: 'spc_006',
    commonName: 'Western Honey Bee',
    scientificName: 'Apis mellifera',
    kingdom: 'Animalia',
    phylum: 'Arthropoda',
    class: 'Insecta',
    order: 'Hymenoptera',
    family: 'Apidae',
    genus: 'Apis',
    description: 'Vital keystone pollinator supporting global flora, agro-ecosystems, and floral biodiversity worldwide.',
    habitat: 'Temperate and Tropical Woodlands, Orchards, Meadows',
    distribution: 'Global Worldwide',
    threatLevel: 'Least Concern',
    isProtected: false,
    threatFactors: ['Colony Collapse Disorder', 'Varroa Mite Parasitism', 'Neonicotinoid Insecticides'],
    imageUrl: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=600&q=80',
    updatedAt: '2026-01-10T12:00:00Z'
  }
];

export const SEED_RECORDS: BiodiversityRecord[] = [
  {
    recordId: 'rec_pub_001',
    speciesId: 'spc_001',
    submittedBy: 'usr_sci_01',
    submitterName: 'Dr. Elena Rostova',
    submissionDate: '2026-01-18T14:32:00Z',
    status: 'PUBLISHED',
    description: 'Confirmed visual and camera-trap sighting of an adult female Bengal tiger with two cubs in Core Mangrove Sector 4B. Distinct stripe morphology matches historical catalog ID-BG-2022-F9.',
    location: {
      latitude: 21.9497,
      longitude: 88.8992,
      region: 'Sundarbans Tiger Reserve, Sector 4B',
      country: 'India / Bangladesh',
      habitatType: 'Tidal Halophytic Mangrove Forest',
      isSensitive: true
    },
    version: 2,
    trustScore: 96,
    trustBadge: 'High',
    requiredConsensus: 2,
    assignedReviewers: ['usr_rev_01', 'usr_rev_02'],
    verifications: [
      {
        verificationId: 'ver_001',
        recordId: 'rec_pub_001',
        reviewerId: 'usr_rev_01',
        reviewerName: 'Prof. Thandiwe Moyo',
        decision: 'Verified',
        comments: 'Flawless evidentiary submission. Photographic stripe match confirmed against historical registry. DNA locus matches maternal lineage from 2022 census.',
        reviewDate: '2026-01-20T10:15:00Z',
        confidenceScore: 5
      },
      {
        verificationId: 'ver_002',
        recordId: 'rec_pub_001',
        reviewerId: 'usr_rev_02',
        reviewerName: 'Dr. Lucas Vance',
        decision: 'Verified',
        comments: 'eDNA soil swab accession verified against GenBank BankIt-281903. High sequencing fidelity across cytochrome b marker. Approved.',
        reviewDate: '2026-01-21T15:40:00Z',
        confidenceScore: 5
      }
    ],
    dnaSamples: [
      {
        sampleId: 'dna_001',
        recordId: 'rec_pub_001',
        sampleType: 'eDNA',
        collectionDate: '2026-01-17T07:30:00Z',
        description: 'Pugmark clay sediment swab taken within 2 hours of receding tidal surge.',
        sequenceAccession: 'NC_010642.1 (Cytochrome b)',
        labName: 'Wildlife Genetics & Genomics Center, Dehradun',
        primerNotes: 'Tiger specific cyt-b primers TIG-F1 / TIG-R1'
      }
    ],
    researchPapers: [
      {
        paperId: 'pap_001',
        recordId: 'rec_pub_001',
        title: 'Non-Invasive Genomic Monitoring of Apex Predators in Coastal Mangrove Ecosystems',
        authors: ['Rostova, E.', 'Moyo, T.', 'Vance, L.'],
        publicationDate: '2025-11-12',
        journal: 'Journal of Conservation Biology & Molecular Ecology',
        doi: '10.1111/cobi.14182',
        abstract: 'Demonstrates environmental DNA extraction methodology from tidal mudflats for Panthera tigris population enumeration.'
      }
    ],
    versionHistory: [
      {
        version: 1,
        timestamp: '2026-01-18T10:00:00Z',
        updatedBy: 'usr_sci_01',
        description: 'Preliminary field sighting of adult tiger with offspring in Sundarbans.',
        location: {
          latitude: 21.9497,
          longitude: 88.8992,
          region: 'Sundarbans Tiger Reserve, Sector 4B',
          country: 'India',
          habitatType: 'Tidal Mangroves',
          isSensitive: true
        },
        dnaSamplesCount: 0,
        researchPapersCount: 0,
        changesSummary: 'Initial field draft created by Dr. Rostova'
      }
    ]
  },
  {
    recordId: 'rec_pub_002',
    speciesId: 'spc_003',
    submittedBy: 'usr_sci_02',
    submitterName: 'Dr. Aarav Patel',
    submissionDate: '2026-02-04T16:10:00Z',
    status: 'PUBLISHED',
    description: 'Hydrophone array acoustic detection paired with drone photogrammetry of a mother-calf pair of Balaenoptera musculus migrating southbound along the Mendocino Escarpment.',
    location: {
      latitude: 39.5218,
      longitude: -124.8193,
      region: 'California Current Upwelling Zone, Mendocino Trench',
      country: 'United States',
      habitatType: 'Deep Oceanic Pelagic Upwelling',
      isSensitive: false
    },
    version: 1,
    trustScore: 92,
    trustBadge: 'High',
    requiredConsensus: 2,
    assignedReviewers: ['usr_rev_01', 'usr_rev_02'],
    verifications: [
      {
        verificationId: 'ver_003',
        recordId: 'rec_pub_002',
        reviewerId: 'usr_rev_01',
        reviewerName: 'Prof. Thandiwe Moyo',
        decision: 'Verified',
        comments: 'Photogrammetric measurements confirm calf length of 8.2 meters. Acoustic spectrogram clearly matches Northeast Pacific blue whale tonal calls.',
        reviewDate: '2026-02-06T11:20:00Z',
        confidenceScore: 5
      },
      {
        verificationId: 'ver_004',
        recordId: 'rec_pub_002',
        reviewerId: 'usr_rev_02',
        reviewerName: 'Dr. Lucas Vance',
        decision: 'Verified',
        comments: 'Skin fluke slough sample sequenced with 99.8% match to Pacific mitochondrial haplotype D-loop. Approved with highest confidence.',
        reviewDate: '2026-02-07T08:50:00Z',
        confidenceScore: 5
      }
    ],
    dnaSamples: [
      {
        sampleId: 'dna_002',
        recordId: 'rec_pub_002',
        sampleType: 'Tissue',
        collectionDate: '2026-02-04T17:45:00Z',
        description: 'Biopsy dart collected sloughed epidermis from dorsal flank after breathing surface breach.',
        sequenceAccession: 'NC_001601.1 (Mitochondrial Genome)',
        labName: 'Scripps Oceanic Cetacean Genomics Lab'
      }
    ],
    researchPapers: [
      {
        paperId: 'pap_002',
        recordId: 'rec_pub_002',
        title: 'Longitudinal Acoustic and Epigenetic Tracking of Eastern North Pacific Blue Whales',
        authors: ['Patel, A.', 'Vance, L.', 'Calderon, M.'],
        publicationDate: '2025-08-19',
        journal: 'Marine Ecology Progress Series',
        doi: '10.3354/meps14920'
      }
    ],
    versionHistory: []
  },
  {
    recordId: 'rec_rev_003',
    speciesId: 'spc_002',
    submittedBy: 'usr_sci_01',
    submitterName: 'Dr. Elena Rostova',
    submissionDate: '2026-03-02T09:12:00Z',
    status: 'UNDER_REVIEW',
    description: 'Sub-canopy camera trap capture of juvenile Javan Rhinoceros wallowing in peat marsh. Footprint casts suggest individual aged approximately 14-18 months.',
    location: {
      latitude: -6.7491,
      longitude: 105.3341,
      region: 'Ujung Kulon Peninsula, Cikeusik River Basin',
      country: 'Indonesia',
      habitatType: 'Tropical Peat Swamp and Dense Primary Forest',
      isSensitive: true
    },
    version: 1,
    trustScore: 84,
    trustBadge: 'High',
    requiredConsensus: 2,
    assignedReviewers: ['usr_rev_01', 'usr_rev_02'],
    verifications: [
      {
        verificationId: 'ver_005',
        recordId: 'rec_rev_003',
        reviewerId: 'usr_rev_01',
        reviewerName: 'Prof. Thandiwe Moyo',
        decision: 'Verified',
        comments: 'First stage peer verification passed. Footprint cast breadth aligns with sub-adult morphology. Second peer review pending to achieve required 2-reviewer consensus.',
        reviewDate: '2026-03-04T13:30:00Z',
        confidenceScore: 4
      }
    ],
    dnaSamples: [
      {
        sampleId: 'dna_003',
        recordId: 'rec_rev_003',
        sampleType: 'Fecal',
        collectionDate: '2026-03-01T15:20:00Z',
        description: 'Fresh dung bolus swab preserved in 95% ethanol buffer.',
        sequenceAccession: 'KY086241.1',
        labName: 'Bogor Agricultural University Biodiversity Lab'
      }
    ],
    researchPapers: [],
    versionHistory: []
  },
  {
    recordId: 'rec_dft_004',
    speciesId: 'spc_005',
    submittedBy: 'usr_sci_01',
    submitterName: 'Dr. Elena Rostova',
    submissionDate: '2026-03-12T11:00:00Z',
    status: 'DRAFT',
    description: 'Observation of new troop division in southern Mikeno sector. Dominant silverback with two adult females and one infant resting in bamboo zone.',
    location: {
      latitude: -1.4589,
      longitude: 29.4128,
      region: 'Virunga National Park, Southern Mikeno Sector',
      country: 'DR Congo / Rwanda',
      habitatType: 'Sub-Alpine Bamboo & Montane Forest',
      isSensitive: true
    },
    version: 2,
    trustScore: 68,
    trustBadge: 'Medium',
    requiredConsensus: 2,
    assignedReviewers: ['usr_rev_01'],
    verifications: [],
    reviewerNotes: [
      '[Prof. Thandiwe Moyo - Request Info]: Please attach telemetry coordinates or hair snare sample details to verify if the silverback is from the Bageni or Nyakamwe group.'
    ],
    dnaSamples: [
      {
        sampleId: 'dna_004',
        recordId: 'rec_dft_004',
        sampleType: 'Hair/Fur',
        collectionDate: '2026-03-11T09:00:00Z',
        description: 'Shed hair collected from night resting nest 12.',
        sequenceAccession: 'Pending lab extraction'
      }
    ],
    researchPapers: [],
    versionHistory: [
      {
        version: 1,
        timestamp: '2026-03-08T08:00:00Z',
        updatedBy: 'usr_sci_01',
        description: 'Rough sighting of gorilla group in Virunga foothills.',
        location: {
          latitude: -1.4589,
          longitude: 29.4128,
          region: 'Virunga Foothills',
          country: 'DR Congo',
          habitatType: 'Bamboo zone',
          isSensitive: true
        },
        dnaSamplesCount: 0,
        researchPapersCount: 0,
        changesSummary: 'Initial draft v1 submitted for preliminary review'
      }
    ]
  },
  {
    recordId: 'rec_dsp_005',
    speciesId: 'spc_004',
    submittedBy: 'usr_pub_01',
    submitterName: 'Jordan Rivera',
    submissionDate: '2026-02-14T10:00:00Z',
    status: 'DISPUTED',
    description: 'Reported sighting of 5,000 Monarch butterflies clustering in coastal pine forest in mid-winter.',
    location: {
      latitude: 45.5152,
      longitude: -122.6784,
      region: 'Pacific Northwest Urban Park, Portland',
      country: 'United States',
      habitatType: 'Urban Coniferous Park',
      isSensitive: false
    },
    version: 1,
    trustScore: 35,
    trustBadge: 'Low',
    requiredConsensus: 2,
    assignedReviewers: ['usr_rev_02'],
    verifications: [
      {
        verificationId: 'ver_006',
        recordId: 'rec_dsp_005',
        reviewerId: 'usr_rev_02',
        reviewerName: 'Dr. Lucas Vance',
        decision: 'Disputed',
        comments: 'Disputed. Overwintering clustering of Danaus plexippus does not occur at 45°N latitude in February due to sub-freezing thermal limits. Likely confused with Viceroy butterflies or painted ladies.',
        reviewDate: '2026-02-15T14:10:00Z',
        confidenceScore: 5
      }
    ],
    dnaSamples: [],
    researchPapers: [],
    versionHistory: []
  }
];

export const SEED_PROJECTS: ConservationProject[] = [
  {
    projectId: 'prj_001',
    projectName: 'Sundarbans Tiger Corridor Restoration',
    organizationId: 'usr_org_01',
    organizationName: 'WildEarth Conservation Alliance',
    speciesId: 'spc_001',
    speciesCommonName: 'Bengal Tiger',
    description: 'Establishing mangrove buffer corridors and community anti-poaching patrols across the Indian and Bangladeshi border sectors to prevent habitat fragmentation.',
    status: 'Active',
    startDate: '2025-06-01',
    budget: '$2,450,000 USD',
    targetImpact: 'Protect 850 km² of core mangrove habitat and maintain zero poaching incidents through 2027.',
    milestones: [
      { id: 'm1', title: 'Community Warden Training (120 Rangers)', completed: true, targetDate: '2025-12-01' },
      { id: 'm2', title: 'Smart Acoustic Sensors Deployment', completed: true, targetDate: '2026-02-15' },
      { id: 'm3', title: 'Genetic Health Census (GenBank eDNA)', completed: false, targetDate: '2026-11-30' }
    ],
    impactLogs: [
      { date: '2026-01-15', log: 'Decommissioned 14 illegal snare networks along Sector 3 fringe.', recordedBy: 'Sarah Jenkins' },
      { date: '2026-02-28', log: 'Verified breeding pair with cubs confirmed in Sector 4B.', recordedBy: 'Sarah Jenkins' }
    ]
  },
  {
    projectId: 'prj_002',
    projectName: 'Javan Rhinoceros Tsunami Safe Sanctuary',
    organizationId: 'usr_org_01',
    organizationName: 'WildEarth Conservation Alliance',
    speciesId: 'spc_002',
    speciesCommonName: 'Javan Rhinoceros',
    description: 'Establishing an elevated secondary sanctuary in western Java to protect the remaining 76 individuals from catastrophic volcanic eruption and tidal inundation at Ujung Kulon.',
    status: 'Active',
    startDate: '2025-09-15',
    budget: '$4,100,000 USD',
    targetImpact: 'Establish second viable wild breeding sub-population of 15 translocated individuals.',
    milestones: [
      { id: 'm4', title: 'Ecological Habitat Suitability Assessment', completed: true, targetDate: '2026-01-30' },
      { id: 'm5', title: 'Fencing & Perimeter Thermal Drone Surveillance', completed: false, targetDate: '2026-08-15' },
      { id: 'm6', title: 'First Translocation Cohort', completed: false, targetDate: '2027-04-01' }
    ],
    impactLogs: [
      { date: '2026-03-01', log: 'Completed soil pathogen and food plant carrying capacity analysis.', recordedBy: 'Sarah Jenkins' }
    ]
  }
];

export const SEED_THREAT_PROPOSALS: ThreatProposal[] = [
  {
    proposalId: 'prop_001',
    speciesId: 'spc_004',
    speciesName: 'Monarch Butterfly',
    currentThreatLevel: 'Vulnerable',
    proposedThreatLevel: 'Endangered',
    proposedBy: 'usr_gov_01',
    proposerName: 'Marcus Sterling',
    justification: 'Winter census in central Mexico recorded a 59% drop in occupied forest area compared to the 10-year rolling median, driven by widespread droughts and pesticide saturation.',
    scientificEvidence: 'Published peer-reviewed study in Frontiers in Ecology (DOI: 10.1002/fee.2711) and multi-state telemetry surveys.',
    proposedDate: '2026-02-18T10:00:00Z',
    status: 'PENDING'
  },
  {
    proposalId: 'prop_002',
    speciesId: 'spc_001',
    speciesName: 'Bengal Tiger',
    currentThreatLevel: 'Endangered',
    proposedThreatLevel: 'Critically Endangered',
    proposedBy: 'usr_gov_01',
    proposerName: 'Marcus Sterling',
    justification: 'Sea level rise in Sundarbans projected to submerge 96% of suitable breeding grounds by 2070. International trade seizures increased 22% in 2025.',
    scientificEvidence: 'IUCN Red List Comprehensive Re-evaluation 2025-B; CITES Appendix I Special Report.',
    proposedDate: '2026-01-10T14:00:00Z',
    status: 'APPROVED',
    approvedBy: 'usr_gov_01',
    approverName: 'Marcus Sterling (Executive Wildlife Commissioner)',
    approvalDate: '2026-01-15T11:00:00Z',
    approvalNotes: 'Official proclamation signed and published in Federal Wildlife Gazette §2026-019.'
  }
];

export const SEED_NOTIFICATIONS: NotificationItem[] = [
  {
    notificationId: 'notif_001',
    recipientId: 'usr_rev_01',
    recipientRole: 'REVIEWER',
    title: 'New Pending Record for Review',
    message: 'Dr. Elena Rostova submitted a new biodiversity record for "Javan Rhinoceros" requiring your taxonomic expertise.',
    type: 'PENDING_REVIEW',
    date: '2026-03-02T09:15:00Z',
    readStatus: false,
    linkId: 'rec_rev_003',
    linkType: 'record'
  },
  {
    notificationId: 'notif_002',
    recipientId: 'usr_sci_01',
    recipientRole: 'SCIENTIST',
    title: 'Information Requested on Draft',
    message: 'Prof. Thandiwe Moyo requested additional genetic data for your Mountain Gorilla observation (#rec_dft_004).',
    type: 'REQUEST_INFO',
    date: '2026-03-12T11:30:00Z',
    readStatus: false,
    linkId: 'rec_dft_004',
    linkType: 'record'
  },
  {
    notificationId: 'notif_003',
    recipientId: 'usr_org_01',
    recipientRole: 'ORGANIZATION',
    title: 'Verified Sighting Published',
    message: 'A peer-verified Bengal Tiger record (#rec_pub_001) has been published in your active project zone.',
    type: 'VERIFIED',
    date: '2026-01-21T16:00:00Z',
    readStatus: true,
    linkId: 'rec_pub_001',
    linkType: 'record'
  },
  {
    notificationId: 'notif_004',
    recipientId: 'usr_gov_01',
    recipientRole: 'GOVERNMENT',
    title: 'Threat Reclassification Pending Review',
    message: 'Proposal #prop_001 to elevate Monarch Butterfly to "Endangered" is waiting for final executive authorization.',
    type: 'THREAT_UPDATE',
    date: '2026-02-18T10:05:00Z',
    readStatus: false,
    linkId: 'prop_001',
    linkType: 'species'
  }
];

export const SEED_AUDIT_LOGS: AuditLogEntry[] = [
  {
    auditId: 'aud_001',
    timestamp: '2026-01-18T10:00:00Z',
    userId: 'usr_sci_01',
    userName: 'Dr. Elena Rostova',
    userRole: 'SCIENTIST',
    action: 'RECORD_CREATED',
    recordId: 'rec_pub_001',
    speciesId: 'spc_001',
    newValue: 'DRAFT v1',
    justification: 'Field observation logged in Sundarbans Core.'
  },
  {
    auditId: 'aud_002',
    timestamp: '2026-01-18T14:32:00Z',
    userId: 'usr_sci_01',
    userName: 'Dr. Elena Rostova',
    userRole: 'SCIENTIST',
    action: 'RECORD_SUBMITTED',
    recordId: 'rec_pub_001',
    speciesId: 'spc_001',
    oldValue: 'DRAFT',
    newValue: 'UNDER_REVIEW',
    justification: 'Attached eDNA sample & published paper DOI: 10.1111/cobi.14182.'
  },
  {
    auditId: 'aud_003',
    timestamp: '2026-01-20T10:15:00Z',
    userId: 'usr_rev_01',
    userName: 'Prof. Thandiwe Moyo',
    userRole: 'REVIEWER',
    action: 'RECORD_REVIEWED',
    recordId: 'rec_pub_001',
    newValue: 'Decision: Verified (1/2 consensus)',
    justification: 'Photographic stripe match verified.'
  },
  {
    auditId: 'aud_004',
    timestamp: '2026-01-21T15:40:00Z',
    userId: 'usr_rev_02',
    userName: 'Dr. Lucas Vance',
    userRole: 'REVIEWER',
    action: 'RECORD_VERIFIED',
    recordId: 'rec_pub_001',
    oldValue: 'UNDER_REVIEW',
    newValue: 'VERIFIED (Consensus 2/2 Reached)',
    justification: 'eDNA GenBank sequence NC_010642.1 confirmed.'
  },
  {
    auditId: 'aud_005',
    timestamp: '2026-01-21T15:55:00Z',
    userId: 'usr_adm_01',
    userName: 'Admin Commander Alex Chen',
    userRole: 'ADMIN',
    action: 'RECORD_PUBLISHED',
    recordId: 'rec_pub_001',
    speciesId: 'spc_001',
    oldValue: 'VERIFIED',
    newValue: 'PUBLISHED',
    justification: 'Golden Rule satisfied: Peer-reviewed consensus achieved with Trust Score 96.'
  },
  {
    auditId: 'aud_006',
    timestamp: '2026-01-15T11:00:00Z',
    userId: 'usr_gov_01',
    userName: 'Marcus Sterling',
    userRole: 'GOVERNMENT',
    action: 'THREAT_APPROVED',
    speciesId: 'spc_001',
    oldValue: 'Endangered',
    newValue: 'Critically Endangered',
    justification: 'IUCN and CITES Appendix I reclassification gazetted.'
  }
];

export const SEED_SUBSCRIPTIONS: WatchlistSubscription[] = [
  {
    subscriptionId: 'sub_001',
    userId: 'usr_sci_01',
    speciesId: 'spc_001',
    createdAt: '2025-01-20T10:00:00Z'
  },
  {
    subscriptionId: 'sub_002',
    userId: 'usr_org_01',
    speciesId: 'spc_001',
    region: 'Sundarbans',
    createdAt: '2025-01-25T14:00:00Z'
  },
  {
    subscriptionId: 'sub_003',
    userId: 'usr_sci_02',
    speciesId: 'spc_003',
    createdAt: '2025-02-15T11:00:00Z'
  }
];
