
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from django.utils.html import strip_tags

def send_registration_notif(user, dst_addr):

    subject, from_email = 'Registration Confirmation', 'notify@imagecolony.com'

    html_content = render_to_string('register_notify.html', {'user':user, 'email':dst_addr})
    text_content = strip_tags(html_content) # this strips the html, so people will have the text as well.

    # create the email, and attach the HTML version as well.
    msg = EmailMultiAlternatives(subject, text_content, from_email, [dst_addr])
    msg.attach_alternative(html_content, "text/html")
    msg.send()

