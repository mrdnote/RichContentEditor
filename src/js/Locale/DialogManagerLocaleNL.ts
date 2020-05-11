class DialogManagerLocaleNL extends DialogManagerLocale
{
    DialogSaveButton = "Opslaan";
    DialogCancelButton = "Annuleren";
    ErrorDialogTitle = "Fout";
    FieldValidationErrorMessage = 'Er zijn een of meerdere velden met fouten gevonden. Corrigeer de fouten en probeer het daarna nogmaals.';
}

DialogManager.RegisterLocale(DialogManagerLocaleNL, 'NL');