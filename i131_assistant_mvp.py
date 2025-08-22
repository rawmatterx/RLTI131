"""
I-131 Therapy Assistant MVP

This console-based program demonstrates the core logic for an
I‑131 therapy assistant.  It asks for patient data, performs a simple
eligibility check based on guideline-derived rules, and outputs
preparation guidance, dose suggestions, and post-therapy instructions.

DISCLAIMER: This program is a prototype for demonstration purposes only.
It is not a diagnostic tool and must not be used to make medical decisions.
All recommendations must be reviewed and confirmed by a qualified clinician.

Guideline sources:
- Contraindications: pregnancy and breastfeeding are absolute
  contraindications【364942946076977†L381-L391】.
- Low-iodine diet for 1–2 weeks and TSH stimulation (≥30 mIU/mL)
  needed before therapy【364942946076977†L566-L606】.
- Preparation requirements (fasting 2–4 h before, hydration, baseline labs)
  【364942946076977†L575-L621】.
- Typical doses: ~30 mCi for low‑risk ablation, up to 250 mCi for
  moderate/high‑risk cases【364942946076977†L669-L674】.
- Post-therapy radiation safety precautions for 3–4 days after treatment
  【364942946076977†L682-L689】.
- Common side effects: sialadenitis, xerostomia, dysgeusia
  【364942946076977†L718-L747】.
"""

from dataclasses import dataclass
from typing import Dict, Tuple, List, Optional

@dataclass
class PatientInfo:
    age: int
    sex: str  # 'M' or 'F'
    tsh: float  # mIU/mL
    pregnant: bool
    breastfeeding: bool
    vomiting_diarrhea: bool
    low_iodine_diet: bool
    renal_function_ok: bool
    interfering_meds: bool
    can_follow_safety_instructions: bool
    risk_category: str  # 'low', 'intermediate', 'high'


def get_patient_input() -> PatientInfo:
    """Interactively gather patient information from the user."""
    print("I‑131 Therapy Assistant – Patient Intake")
    age = int(input("Enter patient age (in years): "))
    sex = input("Enter patient sex (M/F): ").strip().upper()
    tsh = float(input("Enter TSH value (mIU/mL): "))
    pregnant = input("Is the patient currently pregnant? (y/n): ").strip().lower() == 'y'
    breastfeeding = input("Is the patient breastfeeding? (y/n): ").strip().lower() == 'y'
    vomiting_diarrhea = input(
        "Does the patient have severe vomiting or diarrhea that would prevent therapy? (y/n): "
    ).strip().lower() == 'y'
    low_iodine_diet = input(
        "Has the patient followed a low-iodine diet for 1–2 weeks? (y/n): "
    ).strip().lower() == 'y'
    renal_function_ok = input(
        "Is the patient's renal function adequate (eGFR/creatinine normal)? (y/n): "
    ).strip().lower() == 'y'
    interfering_meds = input(
        "Is the patient taking interfering medications (e.g., amiodarone or recent iodinated contrast)? (y/n): "
    ).strip().lower() == 'y'
    can_follow_safety_instructions = input(
        "Can the patient comply with radiation-safety instructions (isolation, hygiene)? (y/n): "
    ).strip().lower() == 'y'
    risk_category = input(
        "Risk category (low, intermediate, high) based on tumor factors: "
    ).strip().lower()
    
    return PatientInfo(
        age=age,
        sex=sex,
        tsh=tsh,
        pregnant=pregnant,
        breastfeeding=breastfeeding,
        vomiting_diarrhea=vomiting_diarrhea,
        low_iodine_diet=low_iodine_diet,
        renal_function_ok=renal_function_ok,
        interfering_meds=interfering_meds,
        can_follow_safety_instructions=can_follow_safety_instructions,
        risk_category=risk_category,
    )


def check_eligibility(patient: PatientInfo) -> Tuple[str, List[str]]:
    """
    Check eligibility based on simplified rules. Returns a status string and a list
    of issues or warnings.  Possible statuses: 'contraindicated', 'needs review', 'eligible'.
    """
    issues: List[str] = []
    status = 'eligible'

    if patient.pregnant:
        issues.append("Pregnancy is an absolute contraindication to I‑131 therapy【364942946076977†L381-L391】.")
        status = 'contraindicated'
    if patient.breastfeeding:
        issues.append("Breastfeeding is an absolute contraindication to I‑131 therapy【364942946076977†L381-L391】.")
        status = 'contraindicated'
    if patient.vomiting_diarrhea:
        issues.append("Severe vomiting/diarrhea hinders iodine absorption and is a contraindication【364942946076977†L381-L391】.")
        status = 'contraindicated'
    if not patient.can_follow_safety_instructions:
        issues.append("Inability to comply with radiation-safety instructions is a contraindication【364942946076977†L381-L391】.")
        status = 'contraindicated'
    if not patient.renal_function_ok:
        issues.append("Impaired renal function may delay clearance of radioiodine【364942946076977†L575-L577】; requires specialist review.")
        status = 'needs review'
    if patient.interfering_meds:
        issues.append("Interfering medications or recent iodinated contrast may reduce efficacy【364942946076977†L381-L391】.")
        status = 'needs review'
    if not patient.low_iodine_diet:
        issues.append("Patient has not followed a low-iodine diet; consider postponing therapy【364942946076977†L566-L606】.")
        status = 'needs review'
    if patient.tsh < 30:
        issues.append("TSH is below 30 mIU/mL; therapy is less effective【364942946076977†L566-L599】.")
        status = 'needs review'

    return status, issues


def suggest_dose(risk_category: str) -> str:
    """Provide a typical dose suggestion based on risk category."""
    risk_category = risk_category.lower()
    if risk_category == 'low':
        return "Typical ablation dose ≈30 mCi for low-risk patients【364942946076977†L669-L671】."
    elif risk_category == 'intermediate':
        return "Consider 50–150 mCi for intermediate-risk patients; clinical judgement required【364942946076977†L669-L674】."
    elif risk_category == 'high':
        return "High-risk patients may require up to ~250 mCi【364942946076977†L673-L674】; adjust per institutional protocol."
    else:
        return "Unknown risk category; dosing must be determined by the care team."


def generate_preparation_guidance(patient: PatientInfo) -> str:
    """Return preparation guidance based on patient status."""
    messages = []
    messages.append("\nPreparation Guidance:\n")
    messages.append("• Follow a low-iodine diet for 1–2 weeks before therapy【364942946076977†L566-L606】 (avoid iodized salt, seafood, dairy, certain vegetables).\n")
    messages.append("• Achieve TSH ≥ 30 mIU/mL by withdrawing thyroid hormone or using recombinant human TSH【364942946076977†L566-L599】.\n")
    messages.append("• Fast for 2–4 hours before and 1 hour after taking I‑131【364942946076977†L575-L583】.\n")
    messages.append("• Ensure adequate hydration; drink plenty of water and void frequently【364942946076977†L588-L635】.\n")
    messages.append("• Obtain baseline labs (CBC, creatinine/eGFR, liver function tests, thyroglobulin, TSH) and a pregnancy test for women of childbearing age【364942946076977†L575-L621】.\n")
    messages.append("• Perform diagnostic radioiodine imaging to assess residual disease【364942946076977†L616-L621】.\n")
    messages.append("• Plan for isolation: arrange a private room at the hospital or at home and ensure you can follow radiation-safety instructions【364942946076977†L623-L629】.\n")
    return "".join(messages)


def generate_post_therapy_guidance() -> str:
    """Return post-therapy guidance to reduce radiation exposure to others."""
    messages = []
    messages.append("\nPost‑Therapy Instructions (first 3–4 days)\n")
    messages.append("• Maintain at least a 3‑foot distance from others, especially children and pregnant women【364942946076977†L682-L689】.\n")
    messages.append("• Sleep in a separate bed and avoid physical contact (kissing, hugging)【364942946076977†L682-L689】.\n")
    messages.append("• Use a separate bathroom if possible; flush twice after use and wash hands thoroughly【364942946076977†L682-L689】.\n")
    messages.append("• Wash clothes, bedding, and utensils separately【364942946076977†L682-L689】.\n")
    messages.append("• Stay well‑hydrated and chew sugar‑free candy or gum to stimulate salivary flow and reduce dry mouth【364942946076977†L718-L741】.\n")
    messages.append("• Avoid contact with pets and public transit; drive home alone or sit as far from others as possible【364942946076977†L682-L689】.\n")
    messages.append("• Carry your treatment record when travelling; airport detectors may detect radiation【364942946076977†L692-L703】.\n")
    messages.append("• Use effective contraception for 6–12 months (women) or discuss sperm banking if multiple treatments are anticipated【916605535002282†L246-L260】.\n")
    return "".join(messages)


def generate_side_effects_info() -> str:
    """Return information on common side effects."""
    messages = []
    messages.append("\nCommon Side Effects and Adverse Events\n")
    messages.append("• Acute: nausea, vomiting, taste changes (dysgeusia), neck pain, salivary gland inflammation leading to sialadenitis and xerostomia【364942946076977†L718-L741】.\n")
    messages.append("• Chronic: reduced salivary output and chronic xerostomia in ~10 % of patients【364942946076977†L733-L736】; reduced male fertility and other long‑term effects【364942946076977†L741-L744】.\n")
    messages.append("• Laboratory: transient platelet and leukocyte decrease at 4 weeks with recovery by 8 weeks【364942946076977†L735-L739】.\n")
    messages.append("• Rare: nasolacrimal duct obstruction, lung fibrosis, secondary malignancies【364942946076977†L718-L747】.\n")
    messages.append("Report any severe or persistent symptoms to your care team immediately.\n")
    return "".join(messages)


def main():
    # Collect patient information
    patient = get_patient_input()
    # Check eligibility and list issues
    status, issues = check_eligibility(patient)

    print("\n--- Eligibility Summary ---")
    print(f"Status: {status}")
    if issues:
        print("Issues:")
        for issue in issues:
            print(f"- {issue}")
    else:
        print("No issues detected.")

    # Provide preparation guidance
    print(generate_preparation_guidance(patient))

    # Suggest dose range
    dose_suggestion = suggest_dose(patient.risk_category)
    print(f"\nDose Suggestion (advisory only): {dose_suggestion}\n")

    # Side effects information
    print(generate_side_effects_info())

    # Post-therapy guidance
    print(generate_post_therapy_guidance())

    print("\n*** Reminder: All recommendations are advisory and require clinician confirmation. ***\n")


if __name__ == "__main__":
    main()
