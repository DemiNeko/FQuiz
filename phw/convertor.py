import json
from docx import Document

def parse_docx(docx_file):
    # Открываем документ
    doc = Document(docx_file)
    questions = []
    question = None
    variants = []

    # Чтение документа
    for para in doc.paragraphs:
        text = para.text.strip()

        # Проверяем, является ли текст жирным
        is_bold = False
        for run in para.runs:
            if run.bold:
                is_bold = True
                break  # Если хотя бы один фрагмент текста жирный, считаем, что вопрос правильный

        if text.lower().startswith('<question>'):  # Начало нового вопроса
            if question:
                questions.append({
                    "question": question,
                    "options": variants
                })
            question = text[len('<question>'):].strip()
            variants = []  # Очистка старых вариантов

        elif text.lower().startswith('<variant>'):  # Вариант ответа
            variant_text = text[len('<variant>'):].strip()
            variants.append({
                "text": variant_text,
                "isCorrect": is_bold
            })

    # Добавляем последний вопрос
    if question:
        questions.append({
            "question": question,
            "options": variants
        })

    return questions

def save_to_json(questions, output_file):
    with open(output_file, 'w', encoding='utf-8') as json_file:
        json.dump(questions, json_file, ensure_ascii=False, indent=4)

def main():
    input_file = 'C:\\Users\\NEO\Desktop\\IT students for site check.docx'  # Путь к твоему DOCX файлу
    output_file = 'data/engl.json'  # Путь для сохранения JSON

    questions = parse_docx(input_file)
    save_to_json(questions, output_file)
    print(f"Questions saved to {output_file}")

if __name__ == "__main__":
    main()
