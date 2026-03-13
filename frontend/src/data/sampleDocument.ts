export type RiskLevel = 'high' | 'medium' | 'low' | 'none';

export interface Clause {
  id: string;
  number: string;
  title: string;
  text: string;
  riskLevel: RiskLevel;
  explanation?: string;
}

export interface Entity {
  label: string;
  value: string;
  confidence: number;
}

export interface LegalDocument {
  title: string;
  parties: string[];
  effectiveDate: string;
  overallRiskScore: number; // 0-100
  overallRiskLevel: RiskLevel;
  status: string;
  clauses: Clause[];
  entities: Entity[];
}

export const sampleDocument: LegalDocument = {
  title: 'Master Software as a Service Agreement',
  parties: ['Acme Corp LLC', 'TechFlow Solutions Inc.'],
  effectiveDate: 'October 15, 2023',
  overallRiskScore: 78,
  overallRiskLevel: 'high',
  status: 'Analysis Complete',
  entities: [
  { label: 'Governing Law', value: 'State of Delaware', confidence: 98 },
  { label: 'Term Length', value: '3 Years', confidence: 95 },
  { label: 'Auto-Renewal', value: 'Yes (1 Year terms)', confidence: 92 },
  { label: 'Liability Cap', value: '$50,000', confidence: 88 }],

  clauses: [
  {
    id: 'c1',
    number: '1.',
    title: 'Definitions',
    text: "Capitalized terms not otherwise defined in this Agreement shall have the meaning ascribed to them in Exhibit A. 'Service' means the TechFlow cloud-based platform and related APIs.",
    riskLevel: 'none'
  },
  {
    id: 'c2',
    number: '2.',
    title: 'License Grant',
    text: "Subject to the terms and conditions of this Agreement, Provider hereby grants to Customer a non-exclusive, non-transferable, worldwide right to access and use the Service during the Term solely for Customer's internal business operations.",
    riskLevel: 'none'
  },
  {
    id: 'c3',
    number: '3.',
    title: 'Data Ownership and Usage',
    text: 'Customer retains all right, title and interest in and to Customer Data. However, Provider is hereby granted an irrevocable, perpetual, worldwide, royalty-free license to use, reproduce, modify, and create derivative works from Customer Data for any business purpose, including selling aggregated data to third parties.',
    riskLevel: 'high',
    explanation:
    'Grants the provider broad, perpetual rights to use and monetize your data. This is highly unusual for a SaaS agreement and poses a severe data privacy risk.'
  },
  {
    id: 'c4',
    number: '4.',
    title: 'Payment Terms',
    text: 'Customer shall pay all fees specified in Order Forms. Except as otherwise specified herein or in an Order Form, (i) fees are based on Services purchased and not actual usage, (ii) payment obligations are non-cancelable and fees paid are non-refundable, and (iii) quantities purchased cannot be decreased during the relevant subscription term.',
    riskLevel: 'low',
    explanation:
    'Standard non-refundable payment terms, but limits flexibility if usage decreases.'
  },
  {
    id: 'c5',
    number: '5.',
    title: 'Auto-Renewal and Price Increases',
    text: 'This Agreement will automatically renew for successive one-year terms unless either party gives written notice of non-renewal at least 90 days before the end of the applicable term. Provider reserves the right to increase fees by up to 15% per renewal term without prior notice.',
    riskLevel: 'medium',
    explanation:
    '90-day notice period is longer than standard (typically 30-60 days). 15% uncapped annual price increase is above market average (typically 5-7% or CPI).'
  },
  {
    id: 'c6',
    number: '6.',
    title: 'Limitation of Liability',
    text: "IN NO EVENT SHALL PROVIDER'S AGGREGATE LIABILITY ARISING OUT OF OR RELATED TO THIS AGREEMENT EXCEED THE TOTAL AMOUNT PAID BY CUSTOMER HEREUNDER IN THE THREE (3) MONTHS PRECEDING THE INCIDENT. PROVIDER DISCLAIMS ALL LIABILITY FOR INDIRECT, SPECIAL, OR CONSEQUENTIAL DAMAGES.",
    riskLevel: 'high',
    explanation:
    'Liability cap of 3 months fees is extremely low (standard is 12 months). Does not include standard carve-outs for gross negligence, willful misconduct, or IP infringement.'
  },
  {
    id: 'c7',
    number: '7.',
    title: 'Indemnification',
    text: "Customer shall defend, indemnify and hold harmless Provider against any claim, demand, suit or proceeding made or brought against Provider by a third party arising from Customer's use of the Service in violation of this Agreement.",
    riskLevel: 'medium',
    explanation:
    'Unilateral indemnification. Provider does not offer mutual indemnification for IP infringement, which is standard market practice.'
  },
  {
    id: 'c8',
    number: '8.',
    title: 'Governing Law and Jurisdiction',
    text: 'This Agreement shall be governed by the laws of the State of Delaware. Any legal action or proceeding arising under this Agreement will be brought exclusively in the federal or state courts located in Wilmington, Delaware.',
    riskLevel: 'none'
  }]

};