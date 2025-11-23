// Utility function to generate URL-friendly slugs

export const generateSlug = (text: string): string => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    // Replace Persian/Arabic characters with English equivalents
    .replace(/[\u0600-\u06FF]/g, (char) => {
      const persianToEnglish: { [key: string]: string } = {
        'ا': 'a', 'آ': 'a', 'ب': 'b', 'پ': 'p', 'ت': 't', 'ث': 's',
        'ج': 'j', 'چ': 'ch', 'ح': 'h', 'خ': 'kh', 'د': 'd', 'ذ': 'z',
        'ر': 'r', 'ز': 'z', 'ژ': 'zh', 'س': 's', 'ش': 'sh', 'ص': 's',
        'ض': 'z', 'ط': 't', 'ظ': 'z', 'ع': 'a', 'غ': 'gh', 'ف': 'f',
        'ق': 'gh', 'ک': 'k', 'گ': 'g', 'ل': 'l', 'م': 'm', 'ن': 'n',
        'و': 'v', 'ه': 'h', 'ی': 'y', 'ئ': 'y', 'ة': 'h'
      };
      return persianToEnglish[char] || char;
    })
    // Replace spaces with hyphens
    .replace(/\s+/g, '-')
    // Remove all non-word chars except hyphens
    .replace(/[^\w\-]+/g, '')
    // Replace multiple hyphens with single hyphen
    .replace(/\-\-+/g, '-')
    // Remove leading/trailing hyphens
    .replace(/^-+/, '')
    .replace(/-+$/, '');
};

// Generate unique slug by appending number if needed
export const generateUniqueSlug = async (
  text: string,
  Model: any,
  excludeId?: string
): Promise<string> => {
  let slug = generateSlug(text);
  let counter = 1;
  let isUnique = false;

  while (!isUnique) {
    const query: any = { slug };
    if (excludeId) {
      query._id = { $ne: excludeId };
    }

    const existing = await Model.findOne(query);
    
    if (!existing) {
      isUnique = true;
    } else {
      slug = `${generateSlug(text)}-${counter}`;
      counter++;
    }
  }

  return slug;
};
