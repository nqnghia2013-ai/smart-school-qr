const fs = require('fs');
let code = fs.readFileSync('src/pages/DocumentLibrary.tsx', 'utf8');

const oldState = `  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadSubject, setUploadSubject] = useState(SUBJECTS[1]);
  const [uploadType, setUploadType] = useState<Document['type']>('pdf');
  const [uploadLink, setUploadLink] = useState('');`;

const newState = `  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadSubject, setUploadSubject] = useState(SUBJECTS[1]);
  const [uploadType, setUploadType] = useState<Document['type']>('pdf');
  const [uploadLink, setUploadLink] = useState('');
  const [bulkDriveItems, setBulkDriveItems] = useState([{ title: '', link: '' }]);
  
  const handleAddBulkItem = () => {
    setBulkDriveItems([...bulkDriveItems, { title: '', link: '' }]);
  };
  
  const handleRemoveBulkItem = (index: number) => {
    setBulkDriveItems(bulkDriveItems.filter((_, i) => i !== index));
  };
  
  const handleUpdateBulkItem = (index: number, field: 'title' | 'link', value: string) => {
    const newItems = [...bulkDriveItems];
    newItems[index][field] = value;
    setBulkDriveItems(newItems);
  };`;

code = code.replace(oldState, newState);
fs.writeFileSync('src/pages/DocumentLibrary.tsx', code);
