import { Textarea } from "../ui/textarea";
import { cx } from 'classix';
import { Button } from "../ui/button";
import { ArrowUpIcon } from "./icons"
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { useState } from 'react';

interface ChatInputProps {
    question: string;
    setQuestion: (question: string) => void;
    onSubmit: (text?: string) => void;
    isLoading: boolean;
}

const suggestedActions = [
    {
    title: 'إنشاء تقرير تعريفي شامل عن بنك فلسطين',
    label: '',
    action: `أنت محلل خبير متخصص في المؤسسات المالية. استخدم البيانات التالية المستخرجة من الموقع الرسمي لبنك فلسطين لتوليد ملف تعريفي مؤسسي احترافي ومنظم. التقرير يجب أن يشمل الأقسام التالية:

        1. نظرة عامة – معلومات أساسية عن البنك، تاريخه، ورسالته.
        2. الخدمات والمنتجات – ملخص لأهم الخدمات المصرفية (للأفراد، الشركات، والخدمات الرقمية).
        3. القيادة والحوكمة – الشخصيات الرئيسية وهيكل الإدارة.
        4. آخر الأخبار والتطورات – أبرز التحديثات الأخيرة.
        5. المسؤولية الاجتماعية – المبادرات المجتمعية والمشاركة المجتمعية.
        6. التحول الرقمي والابتكار – مبادرات التكنولوجيا المالية أو الذكاء الاصطناعي.
        7. معلومات الاتصال والوصول – الفروع، القنوات الرقمية، وخدمة العملاء.`,
        }
,
    {
        title: 'ما هي العملات التي يمكنني ايداع أموالي في الحساب الجاري؟',
        label: '',
        action: 'ما هي العملات التي يمكنني ايداع أموالي في الحساب الجاري',
    },
];

export const ChatInput = ({ question, setQuestion, onSubmit, isLoading }: ChatInputProps) => {
    const [showSuggestions, setShowSuggestions] = useState(true);

    return(
    <div className="relative w-full flex flex-col gap-4">
        {showSuggestions && (
            <div className="hidden md:grid sm:grid-cols-2 gap-2 w-full">
                {suggestedActions.map((suggestedAction, index) => (
                    <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    transition={{ delay: 0.05 * index }}
                    key={index}
                    className={index > 1 ? 'hidden sm:block' : 'block'}
                    >
                        <Button
                            variant="ghost"
                            onClick={ () => {
                                const text = suggestedAction.action;
                                onSubmit(text);
                                setShowSuggestions(false);
                            }}
                            className="text-left border rounded-xl px-4 py-3.5 text-sm flex-1 gap-1 sm:flex-col w-full h-auto justify-start items-start"
                        >
                            <span className="font-medium">{suggestedAction.title}</span>
                            <span className="text-muted-foreground">
                            {suggestedAction.label}
                            </span>
                        </Button>
                    </motion.div>
                ))}
            </div>
        )}
        <input
        type="file"
        className="fixed -top-4 -left-4 size-0.5 opacity-0 pointer-events-none"
        multiple
        tabIndex={-1}
        />

        <Textarea
        placeholder="Send a message..."
        className={cx(
            'min-h-[24px] max-h-[calc(75dvh)] overflow-hidden resize-none rounded-xl text-base bg-muted',
        )}
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        onKeyDown={(event) => {
            if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault();

                if (isLoading) {
                    toast.error('Please wait for the model to finish its response!');
                } else {
                    setShowSuggestions(false);
                    onSubmit();
                }
            }
        }}
        rows={3}
        autoFocus
        />

        <Button 
            className="rounded-full p-1.5 h-fit absolute bottom-2 right-2 m-0.5 border dark:border-zinc-600"
            onClick={() => onSubmit(question)}
            disabled={question.length === 0}
        >
            <ArrowUpIcon size={14} />
        </Button>
    </div>
    );
}