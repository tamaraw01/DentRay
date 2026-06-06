# AGENTS.md — DentRay Engineering Instructions

## 0. Mission

You are building **DentRay**, a free AI-assisted dental screening web application.

DentRay helps the public perform **early visual screening of suspected dental caries lesions** using smartphone tooth images. The app uses semantic segmentation to show the recognized tooth area, suspected lesion area, visual overlay, and an estimated lesion percentage relative to the tooth area.

DentRay is intended for public-health access, especially for communities with limited access to dentists, dental clinics, or radiographic facilities.

This is not a commercial SaaS.
This is not Asmaraloka.
This is not a diagnosis tool.
This is a free public screening prototype.

---

## 1. Absolute Context Boundary

This repository is only for DentRay.

Never reuse or mention:

* Asmaraloka
* digital gifting
* microsite
* wedding invitation
* luxury SaaS
* pricing plans
* payment flow
* romantic/fantasy copywriting
* cinematic island visuals
* decorative custom cursor
* Mayar
* gifting dashboard
* emotional microsite builder

If any Asmaraloka-related file, variable, copy, component, color token, route, or concept appears, remove it.

DentRay must have its own product identity, architecture, copywriting, visual system, and technical flow.

---

## 2. Product Identity

Product name: **DentRay**

Product type:
Free AI-assisted dental caries screening web application.

Primary users:

* general public
* students
* families
* communities with limited dentist access
* users who need low-cost early visual screening

Main promise:
DentRay provides a free, non-radiative, smartphone-based early screening experience that visualizes suspected dental caries lesion areas.

Core values:

* free public access
* low-cost screening
* non-radiative
* easy to use
* privacy-conscious
* medically cautious
* educational
* accessible on mobile

Tone:

* clear
* calm
* trustworthy
* medical
* public-health oriented
* understandable for non-technical users

Avoid tone:

* luxury
* romantic
* magical
* overly futuristic
* commercial SaaS-heavy
* clinical certainty
* fear-based wording

---

## 3. Medical Safety Rules

DentRay must never claim to diagnose dental disease.

Use safe language:

* early screening
* visual indication
* suspected lesion area
* AI-assisted segmentation
* estimated area
* consult a dentist
* non-radiative screening
* public health support tool

Avoid unsafe language:

* confirmed caries
* diagnosis
* disease severity
* guaranteed result
* replaces dentist
* equivalent to radiography
* medically certified result
* treatment recommendation as certainty

Required disclaimer language must appear in result pages and disclaimer sections:

> DentRay is an AI-assisted early screening tool and does not replace diagnosis by a dentist. The displayed result is a visual indication generated from image segmentation and should be confirmed through clinical examination by a dental professional.

The disclaimer must be visible, not hidden in a footer only.

---

## 4. Core User Flow

The main user flow must be simple:

1. User opens DentRay.
2. User starts screening.
3. User chooses camera or upload.
4. User captures or selects a tooth image.
5. App shows preview.
6. User confirms image.
7. Backend analyzes image.
8. App displays result dashboard.
9. User can retake, upload another image, or download result.

Never analyze immediately after camera capture. Always show preview and ask user to confirm.

---

## 5. Input Requirements

DentRay must support two input modes:

### 5.1 Camera Input

The camera interface must include:

* live browser camera preview
* simple tooth placement frame
* capture button
* preview after capture
* retake button
* use photo button

Do not implement complex real-time camera guidance unless explicitly requested.

Camera should work with:

* mobile browser
* desktop browser with webcam
* localhost development
* HTTPS deployment

Handle camera errors:

* permission denied
* camera unavailable
* insecure origin
* unsupported browser

### 5.2 Upload Input

Upload must support:

* `.jpg`
* `.jpeg`
* `.png`

Upload must include:

* file validation
* preview before analysis
* clear invalid file error
* reasonable file size guard

---

## 6. AI Segmentation Architecture

DentRay uses **two separate segmentation models**.

### 6.1 Tooth Segmentation Model

Purpose:
Detect the tooth region from the input image.

Input:
RGB image resized to `256 x 256`.

Output:
Binary tooth mask.

Model path:
`backend/models/tooth_segmentation_model.keras`

Fallback:
`backend/models/tooth_segmentation_model.h5`

### 6.2 Caries Lesion Segmentation Model

Purpose:
Detect suspected dental caries lesion region.

Input:
RGB image resized to `256 x 256`.

Output:
Binary caries/lesion mask.

Model path:
`backend/models/caries_segmentation_model.keras`

Fallback:
`backend/models/caries_segmentation_model.h5`

---

## 7. Inference Pipeline

The backend inference pipeline must follow this exact logic:

1. Validate uploaded image.
2. Decode image safely.
3. Convert image to RGB.
4. Keep original display image for preview.
5. Resize image to `256 x 256`.
6. Normalize pixel values to `[0, 1]`.
7. Expand dimensions to `(1, 256, 256, 3)`.
8. Run tooth segmentation model.
9. Run caries segmentation model.
10. Threshold tooth probability map using default threshold `0.5`.
11. Threshold caries probability map using default threshold `0.5`.
12. Restrict caries area to recognized tooth area.

```python
caries_inside_tooth = caries_mask & tooth_mask
```

13. Calculate tooth pixels.
14. Calculate caries pixels inside tooth.
15. Calculate lesion percentage only relative to tooth area.

```python
lesion_percentage = caries_pixels_inside_tooth / tooth_pixels * 100
```

16. Generate result visualizations:

    * original preview
    * tooth mask
    * caries mask
    * overlay
17. Generate safe interpretation text.
18. Return structured JSON.

---

## 8. Percentage Calculation Rule

The lesion percentage must be calculated against the recognized tooth area only.

Correct:

```text
lesion_percentage = caries_pixels_inside_tooth / tooth_pixels * 100
```

Incorrect:

```text
lesion_percentage = caries_pixels / total_image_pixels * 100
```

If tooth area is empty, invalid, or too small:

* do not calculate misleading percentage
* return `lesion_percentage_of_tooth: null`
* return a warning
* ask user to retake or upload a clearer tooth image

The UI must label the metric as:

> Estimated suspected lesion area relative to the recognized tooth area

Never label it as:

* percentage of disease
* tooth damage percentage
* clinical severity

---

## 9. Interpretation Rules

Use heuristic display categories only.

Recommended thresholds:

```text
0%                  → No visible indication detected
> 0% and < 2%       → Low visual indication
2% to 8%            → Moderate visual indication
> 8%                → High visual indication
```

These thresholds are not clinical thresholds.

The interpretation text must always include:

* this is an early screening result
* the result is visual and model-based
* clinical confirmation by a dentist is recommended

Example:

> DentRay detected a moderate visual indication of suspected lesion area within the recognized tooth region. This result is generated by AI segmentation and should be used only as an early screening reference. Please consult a dentist for clinical confirmation.

---

## 10. Backend Architecture

Use FastAPI.

Required routes:

* `GET /health`
* `POST /predict`

Recommended backend structure:

```text
backend/
├── main.py
├── requirements.txt
├── .env.example
├── models/
│   ├── tooth_segmentation_model.keras
│   └── caries_segmentation_model.keras
└── app/
    ├── core/
    │   ├── config.py
    │   └── constants.py
    ├── routes/
    │   ├── health.py
    │   └── predict.py
    ├── schemas/
    │   └── prediction.py
    ├── services/
    │   ├── model_loader.py
    │   ├── preprocessing.py
    │   ├── inference.py
    │   ├── postprocessing.py
    │   ├── overlay.py
    │   ├── metrics.py
    │   ├── interpretation.py
    │   └── report.py
    └── utils/
        ├── image_io.py
        ├── base64_utils.py
        └── validation.py
```

Backend requirements:

* load models once, not on every request
* cache loaded model instances
* support `.keras` and `.h5`
* return clear error when model is missing
* return clear error for invalid image
* configure CORS for local frontend development
* avoid hardcoded absolute paths
* use environment variables where appropriate
* keep image processing deterministic
* keep response schema stable

---

## 11. Prediction API Contract

`POST /predict`

Input:
`multipart/form-data`

Field:
`file`

Response shape:

```json
{
  "success": true,
  "original_preview": "data:image/png;base64,...",
  "tooth_mask": "data:image/png;base64,...",
  "caries_mask": "data:image/png;base64,...",
  "overlay": "data:image/png;base64,...",
  "tooth_area_pixels": 18233,
  "caries_area_pixels": 912,
  "lesion_percentage_of_tooth": 5.0,
  "interpretation_level": "Moderate visual indication",
  "interpretation_text": "DentRay detected a moderate visual indication...",
  "recommendations": [
    "Use this result as an early screening reference only.",
    "Retake the photo if the tooth area is unclear.",
    "Consult a dentist for clinical confirmation."
  ],
  "disclaimer": "DentRay is an AI-assisted early screening tool...",
  "warnings": []
}
```

If tooth mask fails:

```json
{
  "success": false,
  "lesion_percentage_of_tooth": null,
  "warnings": [
    "The tooth area could not be recognized clearly. Please retake the photo with the tooth inside the frame."
  ]
}
```

---

## 12. Frontend Architecture

Use:

* Next.js
* TypeScript
* Tailwind CSS
* shadcn/ui-ready component structure

Recommended frontend structure:

```text
frontend/
├── .env.example
├── package.json
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── src/
    ├── app/
    │   ├── layout.tsx
    │   ├── page.tsx
    │   ├── screening/
    │   │   └── page.tsx
    │   ├── about/
    │   │   └── page.tsx
    │   ├── how-it-works/
    │   │   └── page.tsx
    │   └── disclaimer/
    │       └── page.tsx
    ├── components/
    │   ├── camera/
    │   │   ├── CameraCapture.tsx
    │   │   ├── CameraFrame.tsx
    │   │   └── CapturePreview.tsx
    │   ├── upload/
    │   │   └── ImageUpload.tsx
    │   ├── result/
    │   │   ├── ResultDashboard.tsx
    │   │   ├── ResultSummary.tsx
    │   │   ├── ResultImageGrid.tsx
    │   │   ├── OverlayViewer.tsx
    │   │   ├── PercentageCard.tsx
    │   │   ├── InterpretationCard.tsx
    │   │   ├── RecommendationCard.tsx
    │   │   └── MedicalDisclaimer.tsx
    │   ├── marketing/
    │   │   ├── HeroSection.tsx
    │   │   ├── ProblemSection.tsx
    │   │   ├── SolutionSection.tsx
    │   │   ├── HowItWorksSection.tsx
    │   │   ├── FreeAccessSection.tsx
    │   │   └── DisclaimerSection.tsx
    │   └── shared/
    │       ├── Navbar.tsx
    │       ├── Footer.tsx
    │       ├── Section.tsx
    │       └── LoadingAnalysis.tsx
    ├── config/
    │   └── site.ts
    ├── lib/
    │   ├── api.ts
    │   ├── camera.ts
    │   ├── download.ts
    │   └── utils.ts
    └── types/
        └── prediction.ts
```

---

## 13. UI Design Standard

DentRay UI must look like a serious medical/public-health AI prototype.

Visual direction:

* clean light interface
* white or very light blue background
* soft cyan/blue accent
* dark slate text
* rounded cards
* clear hierarchy
* mobile-first layout
* accessible contrast
* readable typography
* minimal but polished

Do not overdecorate.

Recommended UI keywords:

* clean
* clinical
* calm
* trustworthy
* helpful
* accessible
* public-health oriented

Avoid:

* dark fantasy
* luxury editorial
* emotional gifting
* cinematic visuals
* complex animation
* decorative cursor
* excessive gradients

---

## 14. Required Pages

### 14.1 Landing Page `/`

Must include:

* hero section
* free public screening mission
* problem statement about dental screening access
* solution section
* how it works
* why segmentation
* privacy note
* medical disclaimer
* CTA to `/screening`

### 14.2 Screening Page `/screening`

Must include:

* camera/upload tabs
* camera capture with frame
* upload fallback
* preview before analysis
* analyze button
* loading state
* error state
* result dashboard

### 14.3 About Page `/about`

Must explain:

* what DentRay is
* why it is free
* who it is for
* what it can and cannot do

### 14.4 How It Works Page `/how-it-works`

Must explain:

* smartphone image input
* preprocessing
* tooth segmentation
* caries segmentation
* overlay visualization
* percentage relative to tooth area

### 14.5 Disclaimer Page `/disclaimer`

Must clearly explain:

* not a diagnosis
* not a replacement for dentists
* AI results can be wrong
* photo quality affects results
* clinical confirmation is needed

---

## 15. Result Dashboard Standard

Result dashboard must show:

1. Summary card

   * interpretation level
   * lesion percentage relative to tooth area
   * status message

2. Image grid

   * original image
   * recognized tooth mask
   * suspected lesion mask
   * overlay image

3. Percentage card

   * label: estimated suspected lesion area relative to recognized tooth area
   * value
   * safe explanation

4. Interpretation card

   * safe interpretation text

5. Recommendation card

   * retake if unclear
   * consult dentist
   * maintain oral hygiene
   * use result as early screening only

6. Medical disclaimer card

   * visible and clear

7. Actions

   * retake
   * analyze another image
   * download overlay
   * download simple report if implemented

---

## 16. Privacy Rules

DentRay should avoid collecting personal data.

Default behavior:

* no login
* no patient database
* no medical record storage
* no automatic cloud storage of images
* no unnecessary personal information

Use privacy wording:

> Images are processed for screening and are not stored unless storage is explicitly enabled.

If storage is implemented later, it must be opt-in and clearly explained.

---

## 17. Quality Bar

Do not stop at a barely working scaffold.

Every major feature should include:

* clean implementation
* error handling
* loading state
* empty state where relevant
* mobile responsiveness
* clear labels
* safe copywriting
* TypeScript types on frontend
* modular Python services on backend

Before finishing, run or explain:

* frontend build/check
* backend startup/check
* endpoint test path
* no Asmaraloka references

---

## 18. Codex Skill Usage

Use relevant Codex skills automatically.

Use frontend/UI skills for:

* responsive layout
* design system
* components
* accessibility
* landing page polish
* result dashboard polish

Use Python/backend skills for:

* FastAPI routes
* TensorFlow/Keras loading
* OpenCV preprocessing
* segmentation postprocessing
* API error handling
* model inference pipeline

Use documentation skills for:

* README
* setup guide
* API contract
* usage instructions
* limitations

Use debugging/testing skills for:

* TypeScript errors
* build errors
* backend startup errors
* API integration
* invalid image handling

Do not wait for explicit skill commands. Choose relevant skills based on task.

---

## 19. Definition of Done

A DentRay feature is done only when:

* it follows this AGENTS.md
* it does not include Asmaraloka references
* it uses safe medical wording
* it supports the defined user flow
* it handles errors
* it is responsive
* it is readable
* it does not make diagnosis claims
* it preserves the two-model segmentation architecture
* lesion percentage is calculated against tooth area only
* the result includes visible disclaimer

For backend inference:

* `/health` works
* `/predict` works or returns meaningful model-missing error
* model loading is cached
* invalid images are rejected cleanly
* empty tooth mask is handled safely

For frontend:

* camera/upload UI works
* preview appears before analysis
* result dashboard handles API response
* loading and error states work
* user can retake or analyze another image

---

## 20. Final Audit Checklist

Before final response, check:

* [ ] No Asmaraloka references
* [ ] No gifting/microsite/payment/pricing logic
* [ ] DentRay mission is clear
* [ ] Free public access is clear
* [ ] Medical disclaimer is visible
* [ ] Camera flow exists
* [ ] Upload flow exists
* [ ] Preview before analysis exists
* [ ] Two-model backend structure exists
* [ ] Tooth mask is used for denominator
* [ ] Caries mask is restricted to tooth area
* [ ] Result dashboard shows original, tooth mask, caries mask, overlay
* [ ] Interpretation uses safe wording
* [ ] Frontend uses environment variable for backend URL
* [ ] Backend avoids hardcoded absolute paths
* [ ] README has setup instructions
* [ ] App remains focused and not bloated
