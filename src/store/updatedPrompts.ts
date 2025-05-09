import { Prompt } from '@/types';

// These are the updated transformation prompts using gpt-image-1 model
export const updatedTransformationPrompts: Prompt[] = [
  {
    id: '10',
    title: 'Lego Character Transformation',
    description: 'Transform your photo into a Lego minifigure character',
    systemPrompt: 'Transform the uploaded photo into a Lego minifigure character. Maintain the person\'s essential features but recreate them as a Lego minifigure. Use the classic Lego minifigure style with the characteristic yellow face, simplified features, and the blocky Lego aesthetic.',
    inputFields: [
      {
        id: 'photo',
        label: 'Your Photo',
        placeholder: 'Upload a clear photo of yourself or the person to transform',
        required: true,
        type: 'file',
        accept: 'image/*'
      },
      {
        id: 'style',
        label: 'Lego Style',
        placeholder: 'Classic minifigure, modern Lego movie style, etc.',
        required: false,
        type: 'select',
        options: [
          'Classic Lego Minifigure',
          'Lego Movie Style',
          'Lego Batman Universe',
          'Lego Star Wars Character',
          'Lego Marvel Superhero'
        ]
      },
      {
        id: 'background',
        label: 'Background Setting',
        placeholder: 'Lego city, space, medieval castle, etc.',
        required: false
      }
    ],
    model: 'gpt-image-1',
    creditCost: 180,
    createdAt: Date.now(),
    capabilities: ['transformation'],
    transformationType: 'character',
    presetStyles: [
      'Classic Lego Minifigure',
      'Lego Movie Style',
      'Lego Batman Universe',
      'Lego Star Wars Character',
      'Lego Marvel Superhero'
    ],
    allowCustomStyles: true,
    exampleImageUrl: 'https://picsum.photos/seed/lego1/512/512',
    outputType: 'image'
  },
  {
    id: '11',
    title: 'Studio Ghibli Art Style',
    description: 'Transform photos into the beautiful hand-drawn style of Studio Ghibli animations',
    systemPrompt: 'Transform the uploaded image into the distinctive hand-drawn animation style of Studio Ghibli films with soft, painterly backgrounds, warm lighting, and simple but expressive character faces.',
    inputFields: [
      {
        id: 'photo',
        label: 'Your Photo',
        placeholder: 'Upload a photo to transform',
        required: true,
        type: 'file',
        accept: 'image/*'
      },
      {
        id: 'ghibliFilm',
        label: 'Ghibli Film Reference',
        placeholder: 'Select a Ghibli film style reference',
        required: false,
        type: 'select',
        options: [
          'Spirited Away',
          'My Neighbor Totoro',
          'Princess Mononoke',
          'Howl\'s Moving Castle',
          'Castle in the Sky'
        ]
      },
      {
        id: 'additionalElements',
        label: 'Additional Elements',
        placeholder: 'Any Studio Ghibli style elements you want to add',
        required: false
      }
    ],
    model: 'gpt-image-1',
    creditCost: 180,
    createdAt: Date.now(),
    capabilities: ['transformation'],
    transformationType: 'style',
    presetStyles: [
      'Spirited Away',
      'My Neighbor Totoro',
      'Princess Mononoke',
      'Howl\'s Moving Castle',
      'Castle in the Sky'
    ],
    allowCustomStyles: true,
    exampleImageUrl: 'https://picsum.photos/seed/ghibli1/512/512',
    outputType: 'image'
  },
  {
    id: '12',
    title: 'Pixel Art Converter',
    description: 'Transform any image into nostalgic pixel art with customizable styles',
    systemPrompt: 'Transform the uploaded image into authentic pixel art with limited color palettes, visible pixels, and the nostalgic aesthetic of 8-bit and 16-bit video games. Maintain the core composition while creating clean pixel edges and limited color palettes.',
    inputFields: [
      {
        id: 'photo',
        label: 'Your Image',
        placeholder: 'Upload an image to transform',
        required: true,
        type: 'file',
        accept: 'image/*'
      },
      {
        id: 'pixelDensity',
        label: 'Pixel Style',
        placeholder: 'Select a pixel art style',
        required: true,
        type: 'select',
        options: [
          'NES 8-bit',
          'SNES 16-bit',
          'Game Boy',
          'Sega Genesis',
          'Commodore 64'
        ]
      }
    ],
    model: 'gpt-image-1',
    creditCost: 180,
    createdAt: Date.now(),
    capabilities: ['transformation'],
    transformationType: 'style',
    presetStyles: [
      'NES 8-bit',
      'SNES 16-bit',
      'Game Boy',
      'Sega Genesis',
      'Commodore 64'
    ],
    allowCustomStyles: true,
    exampleImageUrl: 'https://picsum.photos/seed/pixel1/512/512',
    outputType: 'image'
  },
  {
    id: '13',
    title: 'Oil Painting Portrait',
    description: 'Transform your photos into beautiful oil painting portraits in various artistic styles',
    systemPrompt: 'Transform the uploaded photograph into a beautiful oil painting portrait that captures the subject while adding rich textures, brush strokes, and painterly qualities of traditional oil painting.',
    inputFields: [
      {
        id: 'photo',
        label: 'Your Photo',
        placeholder: 'Upload a portrait photo to transform',
        required: true,
        type: 'file',
        accept: 'image/*'
      },
      {
        id: 'artisticStyle',
        label: 'Artistic Style',
        placeholder: 'Select an artistic style',
        required: true,
        type: 'select',
        options: [
          'Classical Rembrandt',
          'Impressionist Monet',
          'Renaissance Style',
          'Modern Expressionist',
          'Dutch Golden Age',
          'Romantic Era'
        ]
      }
    ],
    model: 'gpt-image-1',
    creditCost: 180,
    createdAt: Date.now(),
    capabilities: ['transformation'],
    transformationType: 'style',
    presetStyles: [
      'Classical Rembrandt',
      'Impressionist Monet',
      'Renaissance Style',
      'Modern Expressionist',
      'Dutch Golden Age',
      'Romantic Era'
    ],
    allowCustomStyles: true,
    exampleImageUrl: 'https://picsum.photos/seed/oil1/512/512',
    outputType: 'image'
  },
  {
    id: '14',
    title: 'Comic Book Hero Transformation',
    description: 'Transform yourself into a comic book superhero with custom powers and costume',
    systemPrompt: 'Transform the uploaded photo into a dynamic comic book superhero with heroic pose, bold outlines, and comic book style shading. Add a superhero costume that suits the person while incorporating the selected comic style.',
    inputFields: [
      {
        id: 'photo',
        label: 'Your Photo',
        placeholder: 'Upload a photo of yourself to transform',
        required: true,
        type: 'file',
        accept: 'image/*'
      },
      {
        id: 'comicStyle',
        label: 'Comic Style',
        placeholder: 'Select a comic book style',
        required: true,
        type: 'select',
        options: [
          'Marvel Superhero',
          'DC Comics Style',
          'Manga Hero',
          'Indie Comic',
          'Vintage Comic',
          'X-Men Member'
        ]
      },
      {
        id: 'costumeColors',
        label: 'Costume Colors',
        placeholder: 'Red and blue, black and gold, etc.',
        required: false
      }
    ],
    model: 'gpt-image-1',
    creditCost: 180,
    createdAt: Date.now(),
    capabilities: ['transformation'],
    transformationType: 'character',
    presetStyles: [
      'Marvel Superhero',
      'DC Comics Style',
      'Manga Hero',
      'Indie Comic',
      'Vintage Comic',
      'X-Men Member'
    ],
    allowCustomStyles: true,
    exampleImageUrl: 'https://picsum.photos/seed/comic1/512/512',
    outputType: 'image'
  }
];
