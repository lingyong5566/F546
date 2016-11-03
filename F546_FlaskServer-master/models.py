# from flask_sqlalchemy import SQLAlchemy
# from flask_migrate import Migrate
#
# from F546_Flask import app
# db = SQLAlchemy(app)
#
# class MainResult(db.Model):
#     # This is used to set the table name, mainly for foreign key.
#     __tablename__ = "mainresult"
#
#     metadata_key = db.Column(db.String(128), primary_key=True)
#     url = db.Column(db.String(128))
#     subject_type = db.Column(db.String(50))
#     source = db.Column(db.String(50))
#     destination = db.Column(db.String(50))
#     measurement_agent = db.Column(db.String(50))
#     tool_name = db.Column(db.String(50))
#     input_source = db.Column(db.String(50))
#     input_destination = db.Column(db.String(50))
#     time_interval = db.Column(db.String(50))
#     ip_transport_protocol = db.Column(db.String(50))
#     uri = db.Column(db.String(128))
#     individualResults = db.relationship('IndividualTracerouteResult_Value', backref='mainresult', lazy='dynamic',
#                                         cascade="all, delete-orphan")
#
#     def __init__(self, metadata_key, url, subject_type, source, destination, measurement_agent, tool_name, input_source,
#                  input_destination, time_interval, ip_transport_protocol, uri):
#         self.metadata_key = metadata_key
#         self.url = url
#         self.subject_type = subject_type
#         self.source = source
#         self.destination = destination
#         self.measurement_agent = measurement_agent
#         self.tool_name = tool_name
#         self.input_source = input_source
#         self.input_destination = input_destination
#         self.time_interval = time_interval
#         self.ip_transport_protocol = ip_transport_protocol
#         self.uri = uri
#
#     def __repr__(self):
#         return '<MR:{}>'.format(self.metadata_key)
#
#
# class IndividualTracerouteResult_Value(db.Model):
#     __tablename__ = "individualtracerouteresult_value"
#
#     metadata_key = db.Column(db.String(128), db.ForeignKey('mainresult.metadata_key'), primary_key=True)
#     ts = db.Column(db.String(50), primary_key=True)
#
#     ip = db.Column(db.String(50), primary_key=True)
#     success = db.Column(db.String(30), primary_key=True)
#     error_message = db.Column(db.String(30), primary_key=True)
#     # mtu = db.Column(db.String(30), primary_key=True)
#     rtt = db.Column(db.String(30), primary_key=True)
#     ttl = db.Column(db.String(30), primary_key=True)
#     query = db.Column(db.String(30), primary_key=True)
#     orderNumber = db.Column(db.Integer, primary_key=True, autoincrement=False)
#
#     def __init__(self, metadata_key, ts, ip, success, error_message, rtt, ttl, query, orderNumber):
#         # MTU is not added as it's always null
#         self.metadata_key = metadata_key
#         self.ts = ts
#         self.ip = ip
#         self.success = success
#         self.error_message = error_message
#         # self.mtu = mtu
#         self.rtt = rtt
#         self.ttl = ttl
#         self.query = query
#         self.orderNumber = orderNumber
#
#     def __repr__(self):
#         return '<MR:{}>'.format(self.metadata_key)
#
#
# class IPAddress_Location(db.Model):
#     __tablename__ = "IPAddress_Location"
#     ip = db.Column(db.String(30), primary_key=True)
#     city = db.Column(db.String(30))
#     country = db.Column(db.String(30))
