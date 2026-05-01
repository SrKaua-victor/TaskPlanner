import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import Board from '../src/components/Board';

beforeEach(() => {
    window.localStorage.clear();
});

describe('Testes de Interação e Estado (Kaua)', () => {

    it('deve atualizar o valor do campo de título ao digitar no formulário de nova tarefa', () => {
        render(<Board />);

        fireEvent.click(screen.getByText('Nova Tarefa'));

        const titleInput = screen.getByPlaceholderText('Ex: Finalizar relatório');
        fireEvent.change(titleInput, { target: { value: 'Estudar React' } });

        expect(titleInput).toHaveValue('Estudar React');
    });

    it('deve criar uma nova tarefa ao preencher o título e clicar em Adicionar Tarefa', () => {
        render(<Board />);

        fireEvent.click(screen.getByText('Nova Tarefa'));

        const titleInput = screen.getByPlaceholderText('Ex: Finalizar relatório');
        fireEvent.change(titleInput, { target: { value: 'Tarefa de Teste' } });

        fireEvent.click(screen.getByText('Adicionar Tarefa'));

        expect(screen.getByText('Tarefa de Teste')).toBeInTheDocument();
    });

    it('deve permitir alterar o status de uma tarefa pelo modal de edição', () => {
        const tarefaExistente = [{
            id: 1,
            title: 'Tarefa para Mover',
            description: 'Descrição teste',
            date: '2026-04-08',
            time: '10:00',
            status: 'todo',
            priority: 'medium'
        }];
        window.localStorage.setItem('tasks', JSON.stringify(tarefaExistente));

        render(<Board />);

        expect(screen.getByText('Tarefa para Mover')).toBeInTheDocument();

        const editButton = screen.getByRole('button', { name: 'Editar tarefa' });
        fireEvent.click(editButton);

        expect(screen.getByText('Editar Tarefa')).toBeInTheDocument();

        fireEvent.click(screen.getByText('Salvar'));

        expect(screen.queryByText('Editar Tarefa')).not.toBeInTheDocument();
        expect(screen.getByText('Tarefa para Mover')).toBeInTheDocument();
    });

    it('não deve adicionar uma tarefa se o campo de título estiver vazio', () => {
        render(<Board />);

        fireEvent.click(screen.getByText('Nova Tarefa'));
        fireEvent.click(screen.getByText('Adicionar Tarefa'));

        expect(screen.getByText('Sem tarefas pendentes')).toBeInTheDocument();
        expect(screen.getByText('Nada em progresso')).toBeInTheDocument();
        expect(screen.getByText('Nenhuma tarefa concluída')).toBeInTheDocument();
    });
});
