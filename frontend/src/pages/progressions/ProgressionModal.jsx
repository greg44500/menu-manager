import { useMemo } from 'react';
import Modal from '../../components/common/Modal';
import ProgressionForm from './ProgressionForm';
import ProgressionFormEdit from './ProgressionFormEdit';
import { useGetProgressionByIdQuery } from '../../store/api/progressionsApi';

// --- Synchronisation calendrier actif ---
import { useSelector, useDispatch } from 'react-redux';
import { useGetAllCalendarsQuery } from '../../store/api/calendarApi';
import { setActiveCalendar } from '../../store/slices/calendarSessionSlice';
import { useEffect } from 'react';

const ProgressionModal = ({ isOpen, onClose, progressionData, mode = 'create', onSuccess }) => {
    // PATCH : Synchronisation de la session active
    const activeCalendarId = useSelector(state => state.calendarSession.activeCalendarId);
    const { data: calendarsData } = useGetAllCalendarsQuery();
    const calendars = useMemo(() => calendarsData?.calendars || [], [calendarsData]);
    const dispatch = useDispatch();

    useEffect(() => {
        if (calendars.length && !calendars.some(c => c._id === activeCalendarId)) {
            dispatch(setActiveCalendar({
                id: calendars[0]._id,
                label: calendars[0].label
            }));
        }
    }, [calendars, activeCalendarId, dispatch]);
    // --- Fin PATCH ---

    const { data: refreshedProgression, refetch } = useGetProgressionByIdQuery(progressionData?._id, {
        skip: mode !== 'edit'
    });

    const handleSuccess = async () => {
        if (mode === 'edit' && refetch) {
            const refreshed = await refetch(); // Recharger la progression à jour
            onSuccess?.(refreshed?.data);     // Transmettre les données mises à jour au parent
        } else {
            onSuccess?.();                     // Pour le cas "create"
        }
        onClose?.();
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            onSuccess={handleSuccess}
            title={mode === 'edit' ? 'Modifier une progression' : 'Créer une progression'}
            size='large'
        >
            {mode === 'edit' ? (
                <ProgressionFormEdit
                    progression={refreshedProgression || progressionData}
                    onSuccess={handleSuccess}
                    onClose={onClose}
                />
            ) : (
                <ProgressionForm onClose={onClose} onSuccess={onSuccess} />
            )}
        </Modal>
    );
};

export default ProgressionModal;
