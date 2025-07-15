export class Resources {
    flashCards: string[] = [];
    questions: Questions[] = [];
    relatedBooks: RelatedBooks[] = [];
    videos: Videos[] = [];
    worksheets: string[] = [];
}

export class Videos {
    resourceId: number;
    title: string;
    url: string = '';
}

export class Questions {
questionId : number;
text : string;
}

export class RelatedBooks {
    title: string;
    storyId: number;
    totalPages: number;
    coverUrl: string;
}