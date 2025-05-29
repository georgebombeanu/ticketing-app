import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { LinearProgress, Alert } from '@mui/material';
import { ticketsAPI } from '../../services/api';
import TicketForm from '../../components/tickets/TicketForm';

const EditTicket = () => {
  const { id } = useParams();
  
  const { data: ticket, isLoading, error } = useQuery({
    queryKey: ['ticket', id],
    queryFn: () => ticketsAPI.getById(id).then(res => res.data),
    enabled: !!id,
  });

  if (isLoading) return <LinearProgress />;
  if (error) return <Alert severity="error">Failed to load ticket</Alert>;
  if (!ticket) return <Alert severity="error">Ticket not found</Alert>;

  return <TicketForm ticket={ticket} isEdit={true} />;
};

export default EditTicket;