import datetime
from app.extensions import db
from mongoengine import signals


class MLPrediction(db.Document):
    """
    Historique des prédictions de prix par utilisateur.
    Lié à User via user_id (ReferenceField).
    Suppression User → toutes ses prédictions supprimées (signal post_delete).
    """

    user = db.ReferenceField(
        "User",
        required=True,
        reverse_delete_rule=db.CASCADE   # ← suppression automatique en cascade
    )

    # ── Inputs du bien
    type_bien = db.StringField(required=True)
    surface_m2 = db.IntField(required=True)
    nb_chambres = db.IntField(required=True)
    nombre_etages = db.IntField(required=True)
    annee_construction = db.IntField(required=True)
    etat_bien = db.StringField(required=True)
    region = db.StringField(required=True)
    quartier = db.StringField(required=True)
    prix_terrain_m2 = db.IntField(required=True)
    accessibilite = db.StringField(required=True)
    douche_position = db.StringField(required=True)
    wc_position = db.StringField(required=True)
    garage = db.StringField(required=True)           # "Oui" | "Non"
    jardin = db.StringField(required=True)
    electricite = db.StringField(required=True)
    eau_courante = db.StringField(required=True)

    # ── Output du modèle
    prix_predit = db.IntField(required=True)         # en Ariary
    prix_predit_millions = db.FloatField()           # calculé à la sauvegarde

    # ── Metadata
    label = db.StringField(max_length=100, default=None)   # nom optionnel donné par l'user
    created_at = db.DateTimeField(default=datetime.datetime.utcnow)
    updated_at = db.DateTimeField(default=datetime.datetime.utcnow)

    meta = {
        "collection": "ml_predictions",
        "indexes": ["user", "-created_at"],
        "ordering": ["-created_at"],
    }

    def clean(self):
        """Calcul automatique avant sauvegarde."""
        self.prix_predit_millions = round(self.prix_predit / 1_000_000, 2)
        self.updated_at = datetime.datetime.utcnow()

    def __repr__(self):
        return f"<MLPrediction user={self.user.id} prix={self.prix_predit_millions}M Ar>"