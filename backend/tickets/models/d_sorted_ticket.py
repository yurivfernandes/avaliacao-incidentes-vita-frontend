from django.db import models

from .f_tickets import FTicket


class DSortedTicket(models.Model):
    ticket = models.ForeignKey(
        FTicket, on_delete=models.CASCADE, related_name="sorted_tickets"
    )
    sort_date = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=50)

    class Meta:
        db_table = "d_sorted_tickets"
        verbose_name = "Ticket Classificado"
        verbose_name_plural = "Tickets Classificados"

    def __str__(self):
        return f"{self.ticket.ticket} - {self.status}"
