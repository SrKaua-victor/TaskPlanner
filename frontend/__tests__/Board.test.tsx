import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { DndContext } from '@dnd-kit/core';

import Board from '../src/components/Board';
import Card from '../src/components/Card';

beforeEach(() => {
    window.localStorage.clear();
});

describe('Testes de Renderização e Componentes Visuais do Kanban', () => {

    it('deve renderizar o quadro Kanban principal na tela', () => {
        render(<Board />);

        expect(screen.getByText('Painel de Tarefas')).toBeInTheDocument();
        expect(screen.getByText(/Task Planner/i)).toBeInTheDocument();
    });

    it('deve exibir as três colunas padrão: A Fazer, Em Progresso e Concluído', () => {
        render(<Board />);

        expect(screen.getByText('A Fazer')).toBeInTheDocument();
        expect(screen.getByText('Em Progresso')).toBeInTheDocument();
        expect(screen.getByText('Concluído')).toBeInTheDocument();
    });

    it('deve renderizar o título e a descrição de um cartão de tarefa passados via props', () => {
        const mockTask = {
            id: 1,
            title: 'Estudar Engenharia de Software',
            description: 'Fazer a Tarefa 3 de testes unitários',
            date: '2026-04-03',
            time: '23:59',
            status: 'todo',
            priority: 'high' as const
        };

        const mockDeleteTask = jest.fn();
        const mockOpenEditModal = jest.fn();

        render(
            <DndContext>
                <Card
                    task={mockTask}
                    deleteTask={mockDeleteTask}
                    openEditModal={mockOpenEditModal}
                />
            </DndContext>
        );

        expect(screen.getByText('Estudar Engenharia de Software')).toBeInTheDocument();
        expect(screen.getByText('Fazer a Tarefa 3 de testes unitários')).toBeInTheDocument();
        expect(screen.getByText('Alta')).toBeInTheDocument();
    });

    it('deve renderizar os campos de texto do formulário após clicar em Nova Tarefa', () => {
        render(<Board />);

        fireEvent.click(screen.getByText('Nova Tarefa'));

        expect(screen.getByPlaceholderText('Ex: Finalizar relatório')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Detalhes da tarefa...')).toBeInTheDocument();
    });
});

describe('Testes de Lógica com Mocks (Tarefa 4)', () => {

    beforeEach(() => {
        window.localStorage.clear();
        jest.clearAllMocks();
    });

    it('deve carregar as tarefas do LocalStorage ao iniciar o Board (Mock de Dependência)', () => {
        const mockTasks = [
            {
                id: 123,
                title: 'Tarefa Mockada Inatel',
                description: 'Testando Mock C14',
                date: '',
                time: '',
                status: 'todo',
                priority: 'high'
            }
        ];

        const getItemSpy = jest.spyOn(Storage.prototype, 'getItem').mockReturnValue(JSON.stringify(mockTasks));

        render(<Board />);

        expect(screen.getByText('Tarefa Mockada Inatel')).toBeInTheDocument();

        getItemSpy.mockRestore();
    });

    it('deve simular a exclusão de uma tarefa mockando a confirmação do usuário', () => {
        const confirmSpy = jest.spyOn(window, 'confirm').mockImplementation(() => true);

        render(<Board />);

        fireEvent.click(screen.getByText('Nova Tarefa'));
        fireEvent.change(screen.getByPlaceholderText('Ex: Finalizar relatório'), { target: { value: 'Tarefa para Deletar' } });
        fireEvent.click(screen.getByText('Adicionar Tarefa'));

        const deleteButton = screen.getByRole('button', { name: 'Excluir tarefa' });
        fireEvent.click(deleteButton);

        expect(confirmSpy).toHaveBeenCalled();
        expect(screen.queryByText('Tarefa para Deletar')).not.toBeInTheDocument();

        confirmSpy.mockRestore();
    });

    it('deve gerar um ID único baseado no timestamp mockado ao adicionar tarefa', () => {
        const mockTimestamp = 123456789;
        const dateSpy = jest.spyOn(Date, 'now').mockReturnValue(mockTimestamp);

        render(<Board />);

        fireEvent.click(screen.getByText('Nova Tarefa'));
        fireEvent.change(screen.getByPlaceholderText('Ex: Finalizar relatório'), { target: { value: 'Tarefa com ID Fixo' } });
        fireEvent.click(screen.getByText('Adicionar Tarefa'));

        const savedData = JSON.parse(localStorage.getItem('tasks') || '[]');
        expect(savedData[0].id).toBe(mockTimestamp);

        dateSpy.mockRestore();
    });

    it('deve chamar o localStorage.setItem com os dados corretos ao adicionar uma nova tarefa', () => {
        const setItemSpy = jest.spyOn(Storage.prototype, 'setItem');

        render(<Board />);

        fireEvent.click(screen.getByText('Nova Tarefa'));
        fireEvent.change(screen.getByPlaceholderText('Ex: Finalizar relatório'), { target: { value: 'Persistir no Banco' } });
        fireEvent.click(screen.getByText('Adicionar Tarefa'));

        expect(setItemSpy).toHaveBeenCalled();

        const lastCallArgs = setItemSpy.mock.calls[setItemSpy.mock.calls.length - 1];
        expect(lastCallArgs[1]).toContain('Persistir no Banco');

        setItemSpy.mockRestore();
    });

    it('deve atualizar uma tarefa existente quando o Mock de salvamento for acionado', () => {
        const initialTask = [{
            id: 1,
            title: 'Antigo',
            description: 'Velho',
            date: '',
            time: '',
            status: 'todo',
            priority: 'low'
        }];
        jest.spyOn(Storage.prototype, 'getItem').mockReturnValue(JSON.stringify(initialTask));

        render(<Board />);

        const editButton = screen.getByRole('button', { name: 'Editar tarefa' });
        fireEvent.click(editButton);

        const inputEdit = screen.getByDisplayValue('Antigo');
        fireEvent.change(inputEdit, { target: { value: 'Novo Título Atualizado' } });

        fireEvent.click(screen.getByText('Salvar'));

        expect(screen.getByText('Novo Título Atualizado')).toBeInTheDocument();
        expect(screen.queryByText('Antigo')).not.toBeInTheDocument();
    });
});

describe('Novos Testes Mock', () => {

    beforeEach(() => {
        window.localStorage.clear();
        jest.clearAllMocks();
    });

    // Novo Teste 1: confirm(false) → tarefa NÃO deve ser excluída
    it('não deve excluir a tarefa quando o usuário cancelar a confirmação (confirm = false)', () => {
        const confirmSpy = jest.spyOn(window, 'confirm').mockImplementation(() => false);

        render(<Board />);

        fireEvent.click(screen.getByText('Nova Tarefa'));
        fireEvent.change(screen.getByPlaceholderText('Ex: Finalizar relatório'), {
            target: { value: 'Tarefa para Manter' }
        });
        fireEvent.click(screen.getByText('Adicionar Tarefa'));

        const deleteButton = screen.getByRole('button', { name: 'Excluir tarefa' });
        fireEvent.click(deleteButton);

        expect(confirmSpy).toHaveBeenCalled();
        expect(screen.getByText('Tarefa para Manter')).toBeInTheDocument();

        confirmSpy.mockRestore();
    });

    // Novo Teste 2: callback openEditModal do Card chamado com a tarefa correta
    it('deve chamar openEditModal com a tarefa correta ao clicar no botão de editar do Card', () => {
        const mockTask = {
            id: 42,
            title: 'Tarefa Callback Test',
            description: 'Verificando callback',
            date: '2026-05-01',
            time: '10:00',
            status: 'todo',
            priority: 'medium' as const
        };

        const mockDeleteTask = jest.fn();
        const mockOpenEditModal = jest.fn();

        render(
            <DndContext>
                <Card
                    task={mockTask}
                    deleteTask={mockDeleteTask}
                    openEditModal={mockOpenEditModal}
                />
            </DndContext>
        );

        const editButton = screen.getByRole('button', { name: 'Editar tarefa' });
        fireEvent.click(editButton);

        expect(mockOpenEditModal).toHaveBeenCalledTimes(1);
        expect(mockOpenEditModal).toHaveBeenCalledWith(mockTask);
    });
});
