export default {
  name: 'person',
  type: 'document',
  title: 'Person',
  fields: [
    {
      name: 'value',
      type: 'number',
      title: 'Value',
    },
    {
      name: 'title',
      type: 'string',
      title: 'Title',
    },
    {
      name: 'person_photo',
      type: 'image',
      title: 'Person Photo',
    },
    {
      name: 'national_id',
      type: 'image',
      title: 'National ID',
    },
    {
      name: 'first_name',
      type: 'image',
      title: 'First Name',
    },
    {
      name: 'second_name',
      type: 'image',
      title: 'Second Name',
    },
    {
      name: 'photo_fingerprint',
      type: 'string',
      title: 'Photo Fingerprint',
    },
  ],
};
