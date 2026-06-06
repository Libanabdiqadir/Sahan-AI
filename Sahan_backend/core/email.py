from djoser.email import ActivationEmail as _DjoserActivationEmail


class ActivationEmail(_DjoserActivationEmail):
    """
    Plain-text-only activation email.

    Djoser's base class sends a multipart message when the template renders
    both a text_body and an html_body block.  This subclass forces the email
    to be strictly text/plain by nulling out self.html before the parent's
    _attach_body() inspects it, so no HTML MIME part is ever created.
    """

    def _attach_body(self) -> None:
        self.html = None          # drop HTML part unconditionally
        super()._attach_body()   # parent now sees html=None → plain text only
