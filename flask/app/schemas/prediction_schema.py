from marshmallow import Schema, fields, validate, ValidationError, validates_schema

# ── Valeurs acceptées (issues du notebook)
TYPES_BIEN = [
    "Appartement", "Bungalow", "Chalet", "Duplex", "Ferme",
    "Immeuble", "Maison coloniale", "Maison d'hôtes", "Maison de ville",
    "Maison écologique", "Maison en briques", "Maison en bois",
    "Maison en terre", "Maison flottante", "Maison jumelée",
    "Maison moderne", "Maison traditionnelle", "Penthouse",
    "Studio", "Terrain", "Villa", "Villa moderne",
]

ETATS_BIEN = ["Ancien", "À rénover", "Neuf", "Rénové", "Très bon état"]

REGIONS = [
    "Alaotra-Mangoro", "Amoron'i Mania", "Analamanga", "Analanjirofo",
    "Androy", "Anosy", "Atsimo-Andrefana", "Atsimo-Atsinanana",
    "Atsinanana", "Betsiboka", "Boeny", "Bongolava", "Diana",
    "Haute Matsiatra", "Ihorombe", "Itasy", "Melaky", "Menabe",
    "SAVA", "Sofia", "Vakinankaratra", "Vatovavy", "Vatovavy-Fitovinany",
    "Ihorombe",
]

QUARTIERS = [
    "Banlieue", "Centre-ville", "Quartier administratif",
    "Quartier chic", "Quartier côtier", "Quartier commerçant",
    "Quartier diplomatique", "Quartier en développement",
    "Quartier forestier", "Quartier historique", "Quartier industriel",
    "Quartier minier", "Quartier périphérique", "Quartier populaire",
    "Quartier portuaire", "Quartier résidentielle", "Quartier touristique",
    "Quartier universitaire", "Zone agricole", "Zone rurale",
]

ACCESSIBILITES = [
    "Chemin de terre", "Piste", "Route goudronnée",
    "Route nationale", "Zone enclavée",
]

POSITIONS = ["Extérieure", "Intérieure", "Partagée"]
OUI_NON = ["Non", "Oui"]
RACCORDE = ["Non raccordé", "Raccordé"]


class PredictionInputSchema(Schema):
    """Validation des inputs avant envoi au modèle ML."""

    type_bien = fields.Str(
        required=True,
        validate=validate.OneOf(TYPES_BIEN),
        error_messages={"required": "Le type de bien est obligatoire."}
    )
    surface_m2 = fields.Int(
        required=True,
        validate=validate.Range(min=10, max=10000),
        error_messages={"required": "La surface est obligatoire."}
    )
    nb_chambres = fields.Int(
        required=True,
        validate=validate.Range(min=0, max=50),
        error_messages={"required": "Le nombre de chambres est obligatoire."}
    )
    nombre_etages = fields.Int(
        required=True,
        validate=validate.Range(min=0, max=30),
        error_messages={"required": "Le nombre d'étages est obligatoire."}
    )
    annee_construction = fields.Int(
        required=True,
        validate=validate.Range(min=1900, max=2025),
        error_messages={"required": "L'année de construction est obligatoire."}
    )
    etat_bien = fields.Str(
        required=True,
        validate=validate.OneOf(ETATS_BIEN)
    )
    region = fields.Str(
        required=True,
        validate=validate.OneOf(REGIONS)
    )
    quartier = fields.Str(
        required=True,
        validate=validate.OneOf(QUARTIERS)
    )
    prix_terrain_m2 = fields.Int(
        required=True,
        validate=validate.Range(min=1000, max=1_000_000),
        error_messages={"required": "Le prix du terrain est obligatoire."}
    )
    accessibilite = fields.Str(
        required=True,
        validate=validate.OneOf(ACCESSIBILITES)
    )
    douche_position = fields.Str(
        required=True,
        validate=validate.OneOf(POSITIONS)
    )
    wc_position = fields.Str(
        required=True,
        validate=validate.OneOf(POSITIONS)
    )
    garage = fields.Str(
        required=True,
        validate=validate.OneOf(OUI_NON)
    )
    jardin = fields.Str(
        required=True,
        validate=validate.OneOf(OUI_NON)
    )
    electricite = fields.Str(
        required=True,
        validate=validate.OneOf(RACCORDE)
    )
    eau_courante = fields.Str(
        required=True,
        validate=validate.OneOf(RACCORDE)
    )
    # Optionnel : label donné par l'user
    label = fields.Str(
        load_default=None,
        validate=validate.Length(max=100)
    )


class PredictionUpdateSchema(Schema):
    """
    CRUD prédiction — update.
    On peut modifier le label et/ou les inputs pour recalculer.
    """
    label = fields.Str(validate=validate.Length(max=100))

    # Tous les champs inputs redeviennent optionnels pour le PATCH
    type_bien = fields.Str(validate=validate.OneOf(TYPES_BIEN))
    surface_m2 = fields.Int(validate=validate.Range(min=10, max=10000))
    nb_chambres = fields.Int(validate=validate.Range(min=0, max=50))
    nombre_etages = fields.Int(validate=validate.Range(min=0, max=30))
    annee_construction = fields.Int(validate=validate.Range(min=1900, max=2025))
    etat_bien = fields.Str(validate=validate.OneOf(ETATS_BIEN))
    region = fields.Str(validate=validate.OneOf(REGIONS))
    quartier = fields.Str(validate=validate.OneOf(QUARTIERS))
    prix_terrain_m2 = fields.Int(validate=validate.Range(min=1000, max=1_000_000))
    accessibilite = fields.Str(validate=validate.OneOf(ACCESSIBILITES))
    douche_position = fields.Str(validate=validate.OneOf(POSITIONS))
    wc_position = fields.Str(validate=validate.OneOf(POSITIONS))
    garage = fields.Str(validate=validate.OneOf(OUI_NON))
    jardin = fields.Str(validate=validate.OneOf(OUI_NON))
    electricite = fields.Str(validate=validate.OneOf(RACCORDE))
    eau_courante = fields.Str(validate=validate.OneOf(RACCORDE))

    @validates_schema
    def at_least_one_field(self, data, **kwargs):
        if not data:
            raise ValidationError("Au moins un champ est requis pour la mise à jour.")


class PredictionResponseSchema(Schema):
    """Sérialisation d'une prédiction pour la réponse API."""
    id = fields.Method("get_id")
    user_id = fields.Method("get_user_id")
    label = fields.Str()
    type_bien = fields.Str()
    surface_m2 = fields.Int()
    nb_chambres = fields.Int()
    nombre_etages = fields.Int()
    annee_construction = fields.Int()
    etat_bien = fields.Str()
    region = fields.Str()
    quartier = fields.Str()
    prix_terrain_m2 = fields.Int()
    accessibilite = fields.Str()
    douche_position = fields.Str()
    wc_position = fields.Str()
    garage = fields.Str()
    jardin = fields.Str()
    electricite = fields.Str()
    eau_courante = fields.Str()
    prix_predit = fields.Int()
    prix_predit_millions = fields.Float()
    created_at = fields.DateTime(format="%Y-%m-%d %H:%M:%S")
    updated_at = fields.DateTime(format="%Y-%m-%d %H:%M:%S")

    def get_id(self, obj):
        return str(obj.id)

    def get_user_id(self, obj):
        return str(obj.user.id)