import ModalLayout from '@/layouts/ModalLayout'


interface props{
    onClose: () => void;
    question: string;
    onConfirm: () => void;
}

const ConfirmModal = ({ onClose, onConfirm ,question}: props) => {


  return (
    <ModalLayout onClose={onClose}>
        <div className="max-w-md bg-white rounded-full p-6">
            <div className="w-full flex items-center flex-col gap-10">
                <div className="font-semibold">{question}</div>
                <div className="w-full flex items-center justify-between gap-4">
                    <button className='w-fit text-white px-5 py-1.5 rounded-full bg-red-500' onClick={onClose}>Cancel</button>
                    <button className='w-fit text-white px-5 py-1.5 rounded-full bg-primary' onClick={onConfirm}>Confirm</button>
                </div>
            </div>
        </div>
    </ModalLayout>
  )
}

export default ConfirmModal