export default {
  name: 'person',
  title: 'Person',
  type: 'document',
  fields: [
    {
      name: 'incrementalId',
      title: 'Incremental ID',
      type: 'number',
      hidden: true,
    },
    {
      name: 'title',
      title: 'Title',
      type: 'string',
    },
    {
      name: 'first_name',
      title: 'FirstName',
      type: 'image',
      options: {
        hotspot: true,
      },
    },
    {
      name: 'second_name',
      title: 'SecondName',
      type: 'image',
      options: {
        hotspot: true,
      },
    },
    {
      name: 'national_id',
      title: 'National_ID',
      type: 'image',
      options: {
        hotspot: true,
      },
    },
    {
      name: 'person_photo',
      title: 'Person_photo',
      type: 'image',
      options: {
        hotspot: true,
      },
    },
    {
      name: 'photo_fingerprint',
      title: 'Photo Fingerprint',
      type: 'string',
    },
    {
      name: 'card_image',
      title: 'CardImage',
      type: 'image',
      options: {
        hotspot: true,
      },
    },
  ],
};
