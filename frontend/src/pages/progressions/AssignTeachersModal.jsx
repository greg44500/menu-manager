import { useEffect, useState } from 'react';
import Modal from '../../components/common/Modal'
import { useGetAllUsersQuery } from '../../store/api/usersApi';
import { useAssignTeachersMutation } from '../../store/api/progressionsApi';

const AssignTeachersModal = ({ isOpen, onClose, progressionId, onSuccess }) => {
    const { data: userApiData, isLoading } = useGetAllUsersQuery();
    const [assignTeachers, { isLoading: isSubmitting }] = useAssignTeachersMutation();
    const [selectedTeachers, setSelectedTeachers] = useState([]);
    const [filter, setFilter] = useState('all');

    const users = userApiData?.data || [];
    const teachers = users.filter(user => user.isTeacher);

    const filteredTeachers = filter === 'all'
        ? teachers
        : teachers.filter(t => t.specialization === filter);

    const handleSubmit = async () => {
        try {
            await assignTeachers({ id: progressionId, teachers: selectedTeachers }).unwrap();
            onSuccess?.();
            onClose();
        } catch (err) {
            console.error('Erreur assignation formateurs :', err);
        }
    };

    const toggleTeacher = (id) => {
        setSelectedTeachers(prev =>
            prev.includes(id) ? prev.filter(tid => tid !== id) : [...prev, id]
        );
    };

    useEffect(() => {
        if (!isOpen) setSelectedTeachers([]);
    }, [isOpen]);

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Assigner des formateurs">

            <div className="mb-4">
                <label className="label">Filtrer par spécialité :</label>
                <select className="input" value={filter} onChange={e => setFilter(e.target.value)}>
                    <option value="all">Tous</option>
                    <option value="Cuisine">Cuisine</option>
                    <option value="Service">Service</option>
                </select>
            </div>

            <div className="input">
                {isLoading ? (
                    <p>Chargement des formateurs...</p>
                ) : filteredTeachers.length === 0 ? (
                    <p>Aucun formateur disponible</p>
                ) : filteredTeachers.map(teacher => (
                    <div key={teacher._id} className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            checked={selectedTeachers.includes(teacher._id)}
                            onChange={() => toggleTeacher(teacher._id)}
                        />
                        <span>{teacher.firstname} {teacher.lastname} ({teacher.specialty || 'N/A'})</span>
                    </div>
                ))}
            </div>

            <div className="flex justify-end mt-4 gap-2">
                <button type="submit" className="btn btn-primary" disabled={isSubmitting} onClick={handleSubmit}>
                    {isSubmitting ? 'Assignation...' : 'Assigner'}
                </button>
            </div>
        </Modal>
    );
};

export default AssignTeachersModal;