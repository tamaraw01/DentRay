# DentRay Model Files

Replace the placeholder model files in this directory with the trained U-Net artifact exported from the notebook.

Required primary model:

```text
dentray_unet_model.keras
```

The `.h5` file is not used when it is empty.

The backend does not train models. It only loads the trained `.keras` model for inference.
