from config import db, ma

# This is the database


class Person(db.Model):

    __tablename__ = "person"

    id = db.Column(db.Integer, primary_key=True)
    id_number = db.Column(db.Integer)
    fname = db.Column(db.String(32))
    lname = db.Column(db.String(32))

# Marshmello stuff


class PersonSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = Person
        load_instance = True
        sqla_session = db.session


person_schema = PersonSchema()
people_schema = PersonSchema(many=True)
