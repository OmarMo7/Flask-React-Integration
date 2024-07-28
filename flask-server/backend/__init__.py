import config


def create_app():
    app = config.connex_app
    app.add_api(config.basedir / "swagger2.yml")
    return app
